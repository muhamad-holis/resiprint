"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CropRect } from "@/types";
import { cn } from "@/lib/utils";

interface CropEditorProps {
  imageSrc: string;
  initialRect?: CropRect;
  onChange: (rect: CropRect) => void;
}

type HandlePosition = "tl" | "tr" | "bl" | "br";

const HANDLES: HandlePosition[] = ["tl", "tr", "bl", "br"];
const MIN_SIZE = 0.06;

export function CropEditor({ imageSrc, initialRect, onChange }: CropEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(initialRect?.rotation ?? 0);
  const [rect, setRect] = useState<CropRect>(
    initialRect ?? { x: 0.1, y: 0.1, width: 0.8, height: 0.4, rotation: 0 }
  );

  const dragState = useRef<{
    mode: "move" | HandlePosition | null;
    startX: number;
    startY: number;
    startRect: CropRect;
  }>({ mode: null, startX: 0, startY: 0, startRect: rect });

  const pinchState = useRef<{ initialDistance: number; initialZoom: number } | null>(null);

  useEffect(() => {
    onChange({ ...rect, rotation });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rect, rotation]);

  const getContainerBounds = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { width: 1, height: 1 };
    const bounds = el.getBoundingClientRect();
    return { width: bounds.width, height: bounds.height, left: bounds.left, top: bounds.top };
  }, []);

  const clampRect = (r: CropRect): CropRect => {
    let { x, y, width, height } = r;
    width = Math.max(MIN_SIZE, Math.min(1, width));
    height = Math.max(MIN_SIZE, Math.min(1, height));
    x = Math.max(0, Math.min(1 - width, x));
    y = Math.max(0, Math.min(1 - height, y));
    return { x, y, width, height, rotation: r.rotation };
  };

  const onPointerDownRect = (e: React.PointerEvent, mode: "move" | HandlePosition) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragState.current = { mode, startX: e.clientX, startY: e.clientY, startRect: rect };
  };

  const onPointerMoveRect = (e: React.PointerEvent) => {
    const { mode, startX, startY, startRect } = dragState.current;
    if (!mode) return;
    const bounds = getContainerBounds();
    const dx = (e.clientX - startX) / bounds.width;
    const dy = (e.clientY - startY) / bounds.height;

    const next: CropRect = { ...startRect };

    if (mode === "move") {
      next.x = startRect.x + dx;
      next.y = startRect.y + dy;
    } else {
      if (mode === "tl") {
        next.x = startRect.x + dx;
        next.y = startRect.y + dy;
        next.width = startRect.width - dx;
        next.height = startRect.height - dy;
      } else if (mode === "tr") {
        next.y = startRect.y + dy;
        next.width = startRect.width + dx;
        next.height = startRect.height - dy;
      } else if (mode === "bl") {
        next.x = startRect.x + dx;
        next.width = startRect.width - dx;
        next.height = startRect.height + dy;
      } else if (mode === "br") {
        next.width = startRect.width + dx;
        next.height = startRect.height + dy;
      }
    }

    setRect(clampRect(next));
  };

  const onPointerUpRect = () => {
    dragState.current.mode = null;
  };

  const onTouchStartZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      pinchState.current = { initialDistance: dist, initialZoom: zoom };
    }
  };

  const onTouchMoveZoom = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchState.current) {
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const ratio = dist / pinchState.current.initialDistance;
      const newZoom = Math.max(0.5, Math.min(3, pinchState.current.initialZoom * ratio));
      setZoom(newZoom);
    }
  };

  const onTouchEndZoom = () => {
    pinchState.current = null;
  };

  const applyPreset = (widthRatio: number, heightRatio: number) => {
    setRect((prev) => clampRect({ ...prev, width: widthRatio, height: heightRatio }));
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative aspect-[3/4] w-full touch-none overflow-hidden rounded-2xl bg-secondary shadow-soft"
        onTouchStart={onTouchStartZoom}
        onTouchMove={onTouchMoveZoom}
        onTouchEnd={onTouchEndZoom}
      >
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-150"
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt="Preview resi" className="max-h-full max-w-full select-none object-contain" draggable={false} />
        </div>

        {/* Overlay gelap di luar area crop */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-black/45"
            style={{
              clipPath: `polygon(
                0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                ${rect.x * 100}% ${rect.y * 100}%,
                ${rect.x * 100}% ${(rect.y + rect.height) * 100}%,
                ${(rect.x + rect.width) * 100}% ${(rect.y + rect.height) * 100}%,
                ${(rect.x + rect.width) * 100}% ${rect.y * 100}%,
                ${rect.x * 100}% ${rect.y * 100}%
              )`,
            }}
          />
        </div>

        {/* Area crop */}
        <div
          className="absolute cursor-move border-2 border-primary"
          style={{
            left: `${rect.x * 100}%`,
            top: `${rect.y * 100}%`,
            width: `${rect.width * 100}%`,
            height: `${rect.height * 100}%`,
          }}
          onPointerDown={(e) => onPointerDownRect(e, "move")}
          onPointerMove={onPointerMoveRect}
          onPointerUp={onPointerUpRect}
        >
          {HANDLES.map((pos) => (
            <div
              key={pos}
              onPointerDown={(e) => onPointerDownRect(e, pos)}
              onPointerMove={onPointerMoveRect}
              onPointerUp={onPointerUpRect}
              className={cn(
                "absolute h-5 w-5 rounded-full border-2 border-primary bg-white shadow-soft",
                pos === "tl" && "-left-2.5 -top-2.5 cursor-nwse-resize",
                pos === "tr" && "-right-2.5 -top-2.5 cursor-nesw-resize",
                pos === "bl" && "-bottom-2.5 -left-2.5 cursor-nesw-resize",
                pos === "br" && "-bottom-2.5 -right-2.5 cursor-nwse-resize"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(3, z + 0.2))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setRotation((r) => (r + 90) % 360)}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-1.5">
          <Button variant="secondary" size="sm" onClick={() => applyPreset(0.9, 0.35)}>
            58mm
          </Button>
          <Button variant="secondary" size="sm" onClick={() => applyPreset(0.95, 0.5)}>
            80mm
          </Button>
          <Button variant="secondary" size="sm" onClick={() => applyPreset(0.98, 0.9)}>
            Bebas
          </Button>
        </div>
      </div>
    </div>
  );
}
