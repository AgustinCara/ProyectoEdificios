import React, { useState } from 'react';
import {
  PenTool,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  X,
  Upload,
  Layers,
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface PolygonMapperToolProps {
  isOpen: boolean;
  onClose: () => void;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
}

export const PolygonMapperTool: React.FC<PolygonMapperToolProps> = ({
  isOpen,
  onClose,
  viewBoxWidth = 1200,
  viewBoxHeight = 900,
}) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [copiedPoints, setCopiedPoints] = useState(false);
  const [copiedCentroid, setCopiedCentroid] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate centroid
  const centroid = points.length > 0
    ? {
        x: Math.round(points.reduce((sum, p) => sum + p.x, 0) / points.length),
        y: Math.round(points.reduce((sum, p) => sum + p.y, 0) / points.length),
      }
    : { x: 0, y: 0 };

  const pointsString = points.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join(' ');

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();

    // Map click coordinates to SVG viewBox coordinates
    const scaleX = viewBoxWidth / rect.width;
    const scaleY = viewBoxHeight / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setPoints(prev => [...prev, { x, y }]);
  };

  const handleUndo = () => {
    setPoints(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPoints([]);
  };

  const handleCopyPoints = () => {
    if (!pointsString) return;
    navigator.clipboard.writeText(`points: "${pointsString}"`);
    setCopiedPoints(true);
    setTimeout(() => setCopiedPoints(false), 2000);
  };

  const handleCopyCentroid = () => {
    if (points.length === 0) return;
    navigator.clipboard.writeText(`labelPos: { x: ${centroid.x}, y: ${centroid.y} }`);
    setCopiedCentroid(true);
    setTimeout(() => setCopiedCentroid(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImageUrl(url);
      setPoints([]);
    }
  };

  return (
    <div className="mapper-overlay">
      <div className="mapper-window">
        {/* Header */}
        <div className="mapper-window__header">
          <div className="mapper-window__title">
            <PenTool size={18} className="mapper-window__icon" />
            <span>Editor de Polígonos SVG (Modo Mapeador)</span>
          </div>
          <div className="mapper-window__actions">
            <label className="mapper-btn mapper-btn--outline" title="Subir plano/render propio">
              <Upload size={14} />
              <span>Cargar Imagen</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <button className="mapper-btn mapper-btn--close" onClick={onClose} title="Cerrar">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content canvas */}
        <div className="mapper-canvas-wrap">
          <div className="mapper-canvas">
            {customImageUrl ? (
              <img
                src={customImageUrl}
                alt="Plano cargado"
                className="mapper-canvas__img"
              />
            ) : (
              <div className="mapper-canvas__placeholder">
                <Layers size={32} />
                <p>Haz clic para ir marcando los vértices del polígono sobre las plantas o fachadas reales.</p>
              </div>
            )}

            {/* Interactive SVG Overlay */}
            <svg
              className="mapper-svg"
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              onClick={handleSvgClick}
            >
              {/* Drawn Polygon */}
              {points.length > 1 && (
                <polygon
                  points={pointsString}
                  className="mapper-svg__polygon"
                />
              )}

              {/* Connecting Lines */}
              {points.length > 0 && (
                <polyline
                  points={pointsString}
                  className="mapper-svg__polyline"
                />
              )}

              {/* Vertex Nodes */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={6}
                    className="mapper-svg__vertex"
                  />
                  <text
                    x={pt.x + 8}
                    y={pt.y - 8}
                    className="mapper-svg__vertex-text"
                  >
                    P{idx + 1} ({pt.x}, {pt.y})
                  </text>
                </g>
              ))}

              {/* Centroid indicator */}
              {points.length > 0 && (
                <g>
                  <circle
                    cx={centroid.x}
                    cy={centroid.y}
                    r={8}
                    className="mapper-svg__centroid"
                  />
                  <text
                    x={centroid.x + 12}
                    y={centroid.y + 4}
                    className="mapper-svg__centroid-text"
                  >
                    Centroide ({centroid.x}, {centroid.y})
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Footer toolbar & output */}
        <div className="mapper-toolbar">
          <div className="mapper-output-group">
            <div className="mapper-field">
              <label>Puntos SVG (points):</label>
              <div className="mapper-input-box">
                <input
                  type="text"
                  readOnly
                  value={pointsString ? `points: '${pointsString}'` : 'Haz clic en la pantalla para añadir vértices...'}
                />
                <button
                  className="mapper-btn mapper-btn--small"
                  onClick={handleCopyPoints}
                  disabled={!pointsString}
                >
                  {copiedPoints ? <Check size={14} /> : <Copy size={14} />}
                  {copiedPoints ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="mapper-field">
              <label>Centroide Badge (labelPos):</label>
              <div className="mapper-input-box">
                <input
                  type="text"
                  readOnly
                  value={points.length > 0 ? `labelPos: { x: ${centroid.x}, y: ${centroid.y} }` : '-'}
                />
                <button
                  className="mapper-btn mapper-btn--small"
                  onClick={handleCopyCentroid}
                  disabled={points.length === 0}
                >
                  {copiedCentroid ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCentroid ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          <div className="mapper-controls">
            <button
              className="mapper-btn mapper-btn--secondary"
              onClick={handleUndo}
              disabled={points.length === 0}
            >
              <RotateCcw size={14} />
              Deshacer Punto
            </button>
            <button
              className="mapper-btn mapper-btn--danger"
              onClick={handleClear}
              disabled={points.length === 0}
            >
              <Trash2 size={14} />
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
