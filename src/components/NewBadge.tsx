import { cn } from "@/lib/utils";

interface NewBadgeProps {
  className?: string;
  variant?: "default" | "absolute";
  children?: React.ReactNode;
}

export const NewBadge = ({ className, variant = "default", children = "New" }: NewBadgeProps) => {
  return (
    <span
      className={cn(
        "bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none pointer-events-none",
        variant === "absolute" && "absolute -top-1.5 -right-2 border-2 border-background",
        className
      )}
    >
      {children}
    </span>
  );
};
