import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Workspace = { user: User; profile: Profile; project: Project };

export class WorkspaceResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceResolutionError";
  }
}

/** Resolves the signed-in user's app records using their RLS-limited session. */
export async function resolveWorkspace(): Promise<Workspace | null> {
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: existingProfile, error: profileReadError } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profileReadError) throw resolutionError("profile", profileReadError.message);

  let profile = existingProfile;
  if (!profile) {
    const fullName = user.user_metadata.full_name ?? user.user_metadata.name ?? null;
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: user.id, full_name: fullName })
      .select("id, full_name, created_at")
      .single<Profile>();

    if (error) throw resolutionError("profile", error.message);
    profile = data;
  }

  const { data: existingProject, error: projectReadError } = await supabase
    .from("projects")
    .select("id, owner_id, name, description, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Project>();

  if (projectReadError) throw resolutionError("workspace", projectReadError.message);

  let project = existingProject;
  if (!project) {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        name: "AIMS Workspace",
        description: "Default AI agent operations workspace",
      })
      .select("id, owner_id, name, description, created_at")
      .single<Project>();

    if (error) throw resolutionError("workspace", error.message);
    project = data;
  }

  return { user, profile, project };
}

function resolutionError(record: string, detail: string) {
  const schemaMismatch = /column|relation|schema cache|does not exist/i.test(detail);
  const guidance = schemaMismatch
    ? " Your Supabase Cloud schema is not aligned with the repository schema. Run `supabase/patches/phase5_profile_project_patch.sql` in Supabase SQL Editor."
    : "";

  return new WorkspaceResolutionError(`Could not resolve your ${record}.${guidance} ${detail}`);
}
