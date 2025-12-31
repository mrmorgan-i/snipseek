import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
};

export function Logo({
  size = 32,
  className,
  showText = false,
  textClassName,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ width: size, height: size }}
      >
        <Image
          src="/images/logo.png"
          alt="SnipSeek"
          width={size - 8}
          height={size - 8}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold text-lg",
            textClassName
          )}
        >
          SnipSeek
        </span>
      )}
    </div>
  );
}
