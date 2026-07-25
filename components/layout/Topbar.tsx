import { LogoutButton } from "./LogoutButton";

export function Topbar({ email }: { email: string }) {
  return <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8"><div><p className="text-sm font-semibold text-slate-900">AIMS Workspace</p><p className="text-xs text-slate-500">Demo operations environment</p></div><div className="flex items-center gap-3"><p className="hidden max-w-52 truncate text-xs text-slate-500 sm:block" title={email}>{email}</p><LogoutButton /></div></header>;
}
