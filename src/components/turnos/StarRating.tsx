import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  className = "",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }[size];

  const rating = hoverValue !== null ? hoverValue : value;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(null)}
            className={`transition-transform duration-150 ${
              readonly
                ? "cursor-default"
                : "cursor-pointer hover:scale-115 focus:outline-none"
            }`}
          >
            <Star
              className={`${starSizes} ${
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                  : "text-muted-foreground/40 stroke-[1.5]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
