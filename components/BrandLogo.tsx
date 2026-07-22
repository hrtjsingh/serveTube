import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "text-lg sm:text-xl",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl sm:text-3xl",
  xl: "text-3xl sm:text-4xl",
  "2xl": "text-4xl sm:text-5xl",
  "3xl": "text-5xl sm:text-6xl",
} as const;

const tubeSizeClasses: Record<keyof typeof sizeClasses, string> = {
  sm: "text-xs sm:text-sm",
  md: "text-sm sm:text-base",
  lg: "text-base sm:text-lg",
  xl: "text-lg sm:text-xl",
  "2xl": "text-xl sm:text-2xl",
  "3xl": "text-2xl sm:text-3xl",
};

const dotSizeClasses: Record<keyof typeof sizeClasses, string> = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
  xl: "h-3 w-3",
  "2xl": "h-4 w-4",
  "3xl": "h-5 w-5",
};

type BrandLogoProps = {
  className?: string;
  size?: keyof typeof sizeClasses;
  interactive?: boolean;
};

export function BrandLogo({
  className,
  size = "md",
  interactive = false,
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "relative flex items-center gap-1.5 font-extrabold tracking-tight",
        sizeClasses[size],
        className
      )}
    >
      <span
        className={cn(
          "st-display text-brand",
          interactive && "transition-colors group-hover:text-brand-hover"
        )}
      >
        SERVE
      </span>

      <span
        className={cn(
          "st-jp ml-0.5 rounded border border-brand/30 bg-brand/20 px-1.5 py-0.5 text-brand-foreground shadow-sm shadow-brand/20",
          tubeSizeClasses[size]
        )}
      >
        TUBE
      </span>

      <span
        className={cn(
          "ml-1 rotate-45 bg-brand shadow-sm shadow-brand/40",
          dotSizeClasses[size]
        )}
      />
    </span>
  );
}