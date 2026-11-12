import { useState, useCallback, useRef, useEffect } from 'react';

interface PanZoomState {
  x: number;
  y: number;
  scale: number;
}

interface UsePanZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  scaleStep?: number;
}

interface Point {
  x: number;
  y: number;
}

// Movement (px) after which a press counts as a drag and no longer as a tap/click
const DRAG_THRESHOLD = 6;

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Pan & zoom for a transformed canvas. Works with mouse (drag + wheel) and
 * touch (one-finger drag + two-finger pinch) through Pointer Events.
 */
export function usePanZoom(options: UsePanZoomOptions = {}) {
  const {
    minScale = 0.15,
    maxScale = 5,
    initialScale = 0.9,
    scaleStep = 0.15,
  } = options;

  const [state, setState] = useState<PanZoomState>({
    x: 0,
    y: 0,
    scale: initialScale,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  // Active pointers (one for drag, two for pinch), in container coordinates
  const pointers = useRef<Map<number, Point>>(new Map());
  const dragStart = useRef<Point | null>(null);
  const didDrag = useRef(false);
  const lastPinch = useRef<{ dist: number; mid: Point } | null>(null);

  const clampScale = useCallback(
    (scale: number) => Math.min(maxScale, Math.max(minScale, scale)),
    [minScale, maxScale]
  );

  // New state after scaling around a fixed point (in container coordinates)
  const zoomAround = useCallback(
    (prev: PanZoomState, nextScale: number, focus: Point): PanZoomState => {
      const scale = clampScale(nextScale);
      const ratio = scale / prev.scale;
      return {
        scale,
        x: focus.x - (focus.x - prev.x) * ratio,
        y: focus.y - (focus.y - prev.y) * ratio,
      };
    },
    [clampScale]
  );

  const toLocal = useCallback((e: { clientX: number; clientY: number }): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    return rect
      ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
      : { x: e.clientX, y: e.clientY };
  }, []);

  // Center the canvas so it fits the container
  const centerCanvas = useCallback(
    (canvasWidth: number, canvasHeight: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scale = Math.min(
        (rect.width * 0.9) / canvasWidth,
        (rect.height * 0.9) / canvasHeight,
        1.2
      );
      const x = (rect.width - canvasWidth * scale) / 2;
      const y = (rect.height - canvasHeight * scale) / 2;
      setState({ x, y, scale });
    },
    []
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;

    const point = toLocal(e);
    pointers.current.set(e.pointerId, point);

    if (pointers.current.size === 1) {
      dragStart.current = point;
      didDrag.current = false;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      lastPinch.current = { dist: distance(a, b), mid: midpoint(a, b) };
      didDrag.current = true; // a pinch is never a tap
    }
  }, [toLocal]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const prevPoint = pointers.current.get(e.pointerId);
    if (!prevPoint) return;

    const point = toLocal(e);
    pointers.current.set(e.pointerId, point);

    // Two fingers: pinch-zoom around their midpoint and pan with it
    if (pointers.current.size === 2 && lastPinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = distance(a, b);
      const mid = midpoint(a, b);
      const { dist: lastDist, mid: lastMid } = lastPinch.current;
      lastPinch.current = { dist, mid };

      setState(prev => {
        const zoomed = zoomAround(prev, prev.scale * (dist / lastDist), mid);
        return { ...zoomed, x: zoomed.x + mid.x - lastMid.x, y: zoomed.y + mid.y - lastMid.y };
      });
      return;
    }

    if (pointers.current.size !== 1) return;

    if (!didDrag.current && dragStart.current && distance(point, dragStart.current) > DRAG_THRESHOLD) {
      didDrag.current = true;
    }
    if (!didDrag.current) return;

    setState(prev => ({
      ...prev,
      x: prev.x + point.x - prevPoint.x,
      y: prev.y + point.y - prevPoint.y,
    }));
  }, [toLocal, zoomAround]);

  const handlePointerEnd = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    lastPinch.current = null;
    // Lifting one finger of a pinch: keep panning with the other without a jump
    const remaining = [...pointers.current.values()];
    dragStart.current = remaining[0] ?? null;
  }, []);

  // A drag that ends on a unit/level must not also select it
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (didDrag.current) {
      e.stopPropagation();
      e.preventDefault();
      didDrag.current = false;
    }
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const delta = e.deltaY > 0 ? -scaleStep : scaleStep;
      const focus = toLocal(e);
      setState(prev => zoomAround(prev, prev.scale + delta, focus));
    },
    [scaleStep, toLocal, zoomAround]
  );

  // Buttons zoom around the center of the view
  const zoomBy = useCallback(
    (delta: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const focus = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 };
      setState(prev => zoomAround(prev, prev.scale + delta, focus));
    },
    [zoomAround]
  );

  const zoomIn = useCallback(() => zoomBy(scaleStep * 2), [zoomBy, scaleStep]);
  const zoomOut = useCallback(() => zoomBy(-scaleStep * 2), [zoomBy, scaleStep]);

  const resetZoom = useCallback(
    (canvasWidth: number, canvasHeight: number) => {
      centerCanvas(canvasWidth, canvasHeight);
    },
    [centerCanvas]
  );

  // Prevent default wheel scroll on the container (React's onWheel is passive)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: WheelEvent) => e.preventDefault();
    container.addEventListener('wheel', preventScroll, { passive: false });
    return () => container.removeEventListener('wheel', preventScroll);
  }, []);

  return {
    state,
    containerRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
      onPointerLeave: handlePointerEnd,
      onClickCapture: handleClickCapture,
      onWheel: handleWheel,
    },
    zoomIn,
    zoomOut,
    resetZoom,
    centerCanvas,
    zoomPercent: Math.round(state.scale * 100),
  };
}
