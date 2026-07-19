import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageFallbackProps {
  className?: string;
  emojiClassName?: string;
  iconClassName?: string;
  showText?: boolean;
}

export default function ProductImageFallback({
  className,
  emojiClassName,
  iconClassName,
  showText = true,
}: ProductImageFallbackProps) {
  return (
    <div className={cn(
      "w-full h-full flex flex-col items-center justify-center bg-[oklch(0.97_0.02_35)] text-primary/60 p-2 select-none animate-in fade-in duration-300",
      className
    )}>
      <div className="relative flex items-center justify-center">
        <span className={cn("text-5xl filter drop-shadow-sm select-none", emojiClassName)}>🧸</span>
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-border/40">
          <ImageOff className={cn("h-3 w-3 text-muted-foreground", iconClassName)} />
        </div>
      </div>
      {showText && (
        <span className="text-xs font-semibold tracking-wide text-muted-foreground/80 mt-1 whitespace-nowrap">
          Chưa có ảnh
        </span>
      )}
    </div>
  );
}
