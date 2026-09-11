'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, UserCheck } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signatureDataUrl: string | null, recipientName: string) => void;
}

export default function SignaturePad({ onSignatureChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [recipientName, setRecipientName] = useState('');

  // Init canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl, recipientName);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureChange(null, recipientName);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setRecipientName(name);
    const canvas = canvasRef.current;
    const dataUrl = hasSignature && canvas ? canvas.toDataURL('image/png') : null;
    onSignatureChange(dataUrl, name);
  };

  return (
    <div className="space-y-3 font-sans">
      <div>
        <label className="block text-xs font-bold text-[var(--color-saggin-text-primary)] mb-1 flex items-center gap-1.5">
          <UserCheck size={14} className="text-[var(--color-brand-red)]" />
          <span>Nome e Cognome di chi riceve la merce *</span>
        </label>
        <input 
          type="text"
          value={recipientName}
          onChange={handleNameChange}
          placeholder="es. Geom. Marco Rossi"
          className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-saggin-border)] text-sm bg-white font-medium focus:ring-2 focus:ring-[var(--color-brand-red)] focus:border-transparent outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-[var(--color-saggin-text-primary)] flex items-center gap-1.5">
            <Pen size={14} className="text-[var(--color-brand-red)]" />
            <span>Firma per Ricevuta Cantiere (Touch)</span>
          </label>
          {hasSignature && (
            <button
              type="button"
              onClick={clearSignature}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              <Eraser size={12} />
              <span>Cancella</span>
            </button>
          )}
        </div>

        <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden touch-none h-32 w-full">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />

          {!hasSignature && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300 text-xs font-medium">
              <Pen size={20} className="mb-1 opacity-50" />
              <span>Fai firmare il cliente qui con il dito</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
