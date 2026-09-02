import React, { useRef, useEffect, useState } from 'react';
import { SPDESimulationState, SPDEParameters } from '../types';
import { Eye, Layers, Maximize2, Zap, Compass, Info } from 'lucide-react';

interface SPDECanvasProps {
  state: SPDESimulationState | null;
  params: SPDEParameters;
}

type ViewMode = 'u_state' | 'dm_field' | 'gradient' | 'noise';
type Palette = 'quantum' | 'viridis' | 'plasma' | 'thermal';

export const SPDECanvas: React.FC<SPDECanvasProps> = ({ state, params }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('u_state');
  const [palette, setPalette] = useState<Palette>('quantum');
  const [hoverData, setHoverData] = useState<{ x: number; y: number; val: number; dm: number; noise: number } | null>(null);

  // Color mapping helper
  const getColor = (val: number, min: number, max: number, pal: Palette): [number, number, number] => {
    const range = max - min || 1;
    const t = Math.max(0, Math.min(1, (val - min) / range));

    if (pal === 'quantum') {
      // Deep blue/purple -> Cyan -> Bright white/gold
      if (t < 0.5) {
        const subT = t * 2;
        return [
          Math.floor(10 + subT * 10),
          Math.floor(20 + subT * 180),
          Math.floor(60 + subT * 195)
        ];
      } else {
        const subT = (t - 0.5) * 2;
        return [
          Math.floor(20 + subT * 235),
          Math.floor(200 + subT * 55),
          Math.floor(255)
        ];
      }
    } else if (pal === 'plasma') {
      // Purple -> Pink -> Orange -> Yellow
      return [
        Math.floor(255 * Math.pow(t, 0.6)),
        Math.floor(220 * Math.pow(t, 1.8)),
        Math.floor(255 * (1 - Math.pow(t, 0.8)))
      ];
    } else if (pal === 'viridis') {
      // Dark purple -> Teal -> Yellow green
      return [
        Math.floor(68 + t * (253 - 68)),
        Math.floor(1 + t * (231 - 1)),
        Math.floor(84 + (1 - t) * (140 - 84))
      ];
    } else {
      // Thermal: Black -> Red -> Orange -> White
      if (t < 0.33) {
        return [Math.floor(t * 3 * 255), 0, 0];
      } else if (t < 0.66) {
        return [255, Math.floor((t - 0.33) * 3 * 220), 0];
      } else {
        return [255, 220 + Math.floor((t - 0.66) * 3 * 35), Math.floor((t - 0.66) * 3 * 255)];
      }
    }
  };

  useEffect(() => {
    if (!state || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let grid: number[][] = state.uGrid;
    let min = -1.5;
    let max = 1.5;

    if (viewMode === 'dm_field') {
      grid = state.dmFieldGrid;
      min = -1.2;
      max = 1.2;
    } else if (viewMode === 'gradient') {
      grid = state.gradientNormGrid;
      min = 0;
      max = 4.0;
    } else if (viewMode === 'noise') {
      grid = state.stochasticNoiseGrid;
      min = -2.5;
      max = 2.5;
    }

    const rows = grid.length;
    const cols = grid[0]?.length || 1;

    // Allocate buffer for fast pixel rendering
    const imgData = ctx.createImageData(cols, rows);
    const data = imgData.data;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const val = grid[y][x];
        const [r, g, b] = getColor(val, min, max, palette);
        const pIdx = (y * cols + x) * 4;
        data[pIdx] = r;
        data[pIdx + 1] = g;
        data[pIdx + 2] = b;
        data[pIdx + 3] = 255;
      }
    }

    // Render scaled onto canvas
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = cols;
    offscreenCanvas.height = rows;
    const offCtx = offscreenCanvas.getContext('2d');
    if (offCtx) {
      offCtx.putImageData(imgData, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
    }
  }, [state, viewMode, palette]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    const rows = state.uGrid.length;
    const cols = state.uGrid[0]?.length || 1;

    const gridX = Math.min(cols - 1, Math.max(0, Math.floor(xRatio * cols)));
    const gridY = Math.min(rows - 1, Math.max(0, Math.floor(yRatio * rows)));

    setHoverData({
      x: gridX,
      y: gridY,
      val: state.uGrid[gridY]?.[gridX] ?? 0,
      dm: state.dmFieldGrid[gridY]?.[gridX] ?? 0,
      noise: state.stochasticNoiseGrid[gridY]?.[gridX] ?? 0
    });
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#111114] p-4 flex flex-col gap-3 shadow-sm">
      {/* Title & Mode selector header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <span>SPDE State Field Dynamics</span>
              <span className="text-[10px] font-mono text-blue-400 font-normal px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-500/30 uppercase">
                u(x,t)
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Continuous 2D spatial-temporal stochastic field
            </p>
          </div>
        </div>

        {/* View Mode Pills */}
        <div className="flex items-center gap-1 p-1 bg-[#0c0c0e] rounded border border-white/5 text-[10px]">
          <button
            onClick={() => setViewMode('u_state')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              viewMode === 'u_state'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            u(x,t) Field
          </button>
          <button
            onClick={() => setViewMode('dm_field')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              viewMode === 'dm_field'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Φ_DM Wave
          </button>
          <button
            onClick={() => setViewMode('gradient')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              viewMode === 'gradient'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            |∇u| Energy
          </button>
          <button
            onClick={() => setViewMode('noise')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              viewMode === 'noise'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Ẇ Noise
          </button>
        </div>
      </div>

      {/* Canvas viewport & metrics overlay */}
      <div className="relative aspect-square w-full max-h-[360px] rounded overflow-hidden bg-[#0c0c0e] border border-white/10 shadow-inner group">
        <canvas
          ref={canvasRef}
          width={384}
          height={384}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverData(null)}
          className="w-full h-full object-cover cursor-crosshair"
        />

        {/* Floating probe readout on hover */}
        {hoverData && (
          <div className="absolute top-2 left-2 pointer-events-none px-2.5 py-1.5 rounded bg-[#16161a]/95 border border-white/10 text-[10px] font-mono text-slate-200 shadow-md space-y-0.5">
            <div className="text-blue-400 font-bold uppercase tracking-wider">Probe (x={hoverData.x}, y={hoverData.y})</div>
            <div>u(x,t): <span className="text-white font-semibold">{hoverData.val.toFixed(4)}</span></div>
            <div>Φ_DM: <span className="text-purple-300 font-semibold">{hoverData.dm.toFixed(4)}</span></div>
            <div>Ẇ_noise: <span className="text-rose-300 font-semibold">{hoverData.noise.toFixed(4)}</span></div>
          </div>
        )}

        {/* Field scalar diagnostics badge */}
        <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-2 px-2.5 py-1 rounded bg-[#111114]/90 border border-white/10 text-[10px] font-mono text-slate-300">
          <span>Mean: <strong className="text-blue-400 font-bold">{state?.meanU.toFixed(3) || '0.000'}</strong></span>
          <span className="text-slate-600">|</span>
          <span>RMS: <strong className="text-amber-400 font-bold">{state?.rmsFluctuation.toFixed(3) || '0.000'}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Entropy: <strong className="text-emerald-400 font-bold">{((state?.spatialEntropy || 0) * 100).toFixed(1)}%</strong></span>
        </div>
      </div>

      {/* Palette selector & details footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-mono text-slate-500">Colormap:</span>
          {(['quantum', 'viridis', 'plasma', 'thermal'] as Palette[]).map((pal) => (
            <button
              key={pal}
              onClick={() => setPalette(pal)}
              className={`px-2 py-0.5 text-[10px] rounded uppercase font-mono transition ${
                palette === pal
                  ? 'bg-white/10 text-blue-300 border border-blue-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {pal}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          t = {state?.time.toFixed(2) || '0.00'}s • Step #{state?.step || 0}
        </div>
      </div>
    </div>
  );
};
