export function PresenceAvatars({ users }: { users: { id: string; name: string }[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {users.slice(0, 5).map((u) => (
        <span
          key={u.id}
          title={u.name}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-emerald-500/90 text-[11px] font-bold text-white"
        >
          {u.name.charAt(0).toUpperCase()}
        </span>
      ))}
    </div>
  );
}
