import { Link } from "react-router-dom";
import type { MapProvider } from "@/components/ProviderMap";
import { cn } from "@/lib/utils";

export default function ProviderListCard({
  provider,
  isHighlighted,
  onHover,
  linkTo,
  className,
}: {
  provider: MapProvider;
  isHighlighted?: boolean;
  onHover?: (id: string | null) => void;
  linkTo?: string;
  className?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-[#FBCFE8] flex items-center justify-center text-[#E91E8C] font-bold text-sm flex-shrink-0">
          {provider.initials}
        </div>
        <div className="min-w-0">
          <h4 className="text-[#4C1D95] font-bold text-base">{provider.name}</h4>

          <div className="flex flex-wrap gap-2 mt-1.5 mb-1.5">
            {provider.tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#FDF4FF] text-[#E91E8C] text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[#FBCFE8]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="#2C1810"
                aria-hidden
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span className="font-bold text-[#2C1810]">
                {provider.rating.toFixed(2)}
              </span>
              <span className="text-[#94A3B8]">({provider.reviews})</span>
            </div>
            <span className="text-[#94A3B8]">-</span>
            <span className="font-bold text-[#4C1D95]">{provider.price}</span>
          </div>
        </div>
      </div>

      <div className="text-[#94A3B8] text-xs font-medium sm:text-right flex-shrink-0">
        {provider.distance}
      </div>
    </>
  );

  const cardClass = cn(
    "bg-white rounded-2xl p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm border transition-colors",
    isHighlighted
      ? "border-[#E91E8C] ring-2 ring-[#E91E8C]/20"
      : "border-gray-100",
    linkTo && "hover:border-[#FBCFE8] hover:shadow-md cursor-pointer",
    className,
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={cardClass}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className={cn(cardClass, onHover && "cursor-default")}
      onMouseEnter={() => onHover?.(provider.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {content}
    </div>
  );
}
