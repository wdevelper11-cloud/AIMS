import { LogoutButton } from "./LogoutButton";

export function Topbar({ email, workspaceName }: { email: string; workspaceName: string }) {
  return <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8"><div><p className="text-sm font-semibold text-slate-900">{workspaceName}</p><p className="text-xs text-slate-500">AI agent operations workspace</p></div><div className="flex items-center gap-3"><p className="hidden max-w-52 truncate text-xs text-slate-500 sm:block" title={email}>{email}</p><LogoutButton /></div></header>;
}
