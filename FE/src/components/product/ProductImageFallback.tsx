import { ImageOff } from 'lucide-react';

export default function ProductImageFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[oklch(0.97_0.02_35)] text-primary/60 p-6 select-none animate-in fade-in duration-300">
      <div className="relative mb-2 flex items-center justify-center">
        <span className="text-5xl filter drop-shadow-sm select-none">🧸</span>
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-border/40">
          <ImageOff className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <span className="text-sm font-semibold tracking-wide text-muted-foreground/80 mt-1">Chưa có ảnh</span>
    </div>
  );
}
