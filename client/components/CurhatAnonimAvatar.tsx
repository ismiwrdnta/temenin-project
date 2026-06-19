export function CurhatAnonimAvatar({
  online = false,
  size = "md",
}: {
  online?: boolean;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-12 h-12" : "w-14 h-14";
  const icon = size === "sm" ? 24 : 28;

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${dim} rounded-full bg-[#FBCFE8] flex items-center justify-center`}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden
          className="text-[#7C3AED]"
        >
          <circle cx="14" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M6 24c0-4.418 3.582-8 8-8s8 3.582 8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <text
            x="14"
            y="13"
            textAnchor="middle"
            fill="currentColor"
            fontSize="8"
            fontWeight="bold"
          >
            ?
          </text>
        </svg>
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-white" />
      )}
    </div>
  );
}
