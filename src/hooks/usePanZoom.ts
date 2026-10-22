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

export function usePanZoom(options: UsePanZoomOptions = {}) {
  const {
    minScale = 0.3,
    maxScale = 5,
    initialScale = 0.9,
    scaleStep = 0.15,
  } = options;

  const [state, setState] = useState<PanZoomState>({
    x: 0,
    y: 0,
    scale: initialScale,
  });

  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Center the canvas initially on mount
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start pan on left mouse button and when not clicking on interactive unit
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.unit-polygon') || target.closest('button')) return;

    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    setState(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -scaleStep : scaleStep;
      
      setState(prev => {
        const newScale = Math.min(maxScale, Math.max(minScale, prev.scale + delta));
        
        // Zoom toward mouse position
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const scaleRatio = newScale / prev.scale;
          
          return {
            scale: newScale,
            x: mouseX - (mouseX - prev.x) * scaleRatio,
            y: mouseY - (mouseY - prev.y) * scaleRatio,
          };
        }
        
        return { ...prev, scale: newScale };
      });
    },
    [minScale, maxScale, scaleStep]
  );

  const zoomIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      scale: Math.min(maxScale, prev.scale + scaleStep * 2),
    }));
  }, [maxScale, scaleStep]);

  const zoomOut = useCallback(() => {
    setState(prev => ({
      ...prev,
      scale: Math.max(minScale, prev.scale - scaleStep * 2),
    }));
  }, [minScale, scaleStep]);

  const resetZoom = useCallback(
    (canvasWidth: number, canvasHeight: number) => {
      centerCanvas(canvasWidth, canvasHeight);
    },
    [centerCanvas]
  );

  // Prevent default wheel scroll on the container
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
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onWheel: handleWheel,
    },
    zoomIn,
    zoomOut,
    resetZoom,
    centerCanvas,
    zoomPercent: Math.round(state.scale * 100),
  };
}
