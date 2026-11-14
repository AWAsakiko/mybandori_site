export function RoleBadge({ role }: { role?: string | null }) {
  if (role === "owner") {
    return (
      <span
        className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
        title="站主"
      >
        [站主]
      </span>
    );
  }
  if (role === "admin") {
    return (
      <span
        className="rounded bg-sky-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
        title="管理员"
      >
        [管理员]
      </span>
    );
  }
  return null;
}
