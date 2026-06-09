import { Camera, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "lg";
  label?: string;
};

export function StarRating({
  value,
  onChange,
  size = "lg",
  label,
}: StarRatingProps) {
  const starSize = size === "lg" ? "w-9 h-9" : "w-5 h-5";

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} bintang`}
        >
          <Star
            className={cn(
              starSize,
              star <= value
                ? "fill-[#FACC15] text-[#FACC15]"
                : "fill-none text-[#D8B4E2]",
            )}
          />
        </button>
      ))}
    </div>
  );
}
