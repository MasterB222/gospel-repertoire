import clsx from "clsx";

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={clsx("shrink-0", className)} aria-hidden="true">
      <defs>
        <linearGradient id="gospel-logo-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#EAD08C" />
          <stop offset="1" stopColor="#B8892B" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#gospel-logo-grad)" />
      <path
        d="M14.5 26.6V14.9c0-.55.38-1.02.92-1.14l8.6-1.9c.66-.15 1.28.36 1.28 1.03v8.9"
        fill="none"
        stroke="#2A0F1E"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13.6" cy="26.6" r="3" fill="none" stroke="#2A0F1E" strokeWidth="1.8" />
      <circle cx="24.3" cy="23.8" r="3" fill="none" stroke="#2A0F1E" strokeWidth="1.8" />
    </svg>
  );
}
