/**
 * @fileoverview Before/After Karşılaştırma Slider Bileşeni.
 * İki görseli üst üste koyarak kullanıcının sürüklenebilir bir bar ile
 * aradaki farkı görmesini sağlar. Dokunmatik ve fare hareketlerini destekler.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

export default function ComparisonSlider({ beforeImage, afterImage, beforeLabel = 'Orijinal', afterLabel = 'AI Karakteri' }) {
  const [sliderPosition, setSliderPosition] = useState(50); // Yüzde 50'den başlasın
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    if (e.touches && e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square overflow-hidden rounded-xl select-none bg-gray-100 dark:bg-navy-900 border border-gray-150 dark:border-white/10"
      onMouseDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setSliderPosition((x / rect.width) * 100);
      }}
      onTouchStart={() => {
        setIsDragging(true);
      }}
    >
      {/* Before Image (Orijinal) - Altta tam kaplayacak şekilde */}
      <img
        src={beforeImage}
        alt={beforeLabel}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <span className="absolute top-3 left-3 z-10 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        {beforeLabel}
      </span>

      {/* After Image (AI Sonucu) - Üstte, clip-path ile kesilmiş olarak */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
      >
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute top-3 right-3 z-10 rounded-lg bg-brand-500/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>

      {/* Sürüklenebilir Ayrıcı Çizgi ve Tutamaç */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-navy-700 shadow-xl border border-gray-200 flex items-center justify-center text-lg font-bold hover:scale-110 active:scale-95 transition-transform duration-100">
          ↔
        </div>
      </div>
    </div>
  );
}

ComparisonSlider.propTypes = {
  beforeImage: PropTypes.string.isRequired,
  afterImage: PropTypes.string.isRequired,
  beforeLabel: PropTypes.string,
  afterLabel: PropTypes.string,
};
