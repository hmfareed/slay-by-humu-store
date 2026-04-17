'use client';

import { useState } from 'react';

export default function ImageLoupe({ src, alt }: { src: string; alt: string; }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showLoupe, setShowLoupe] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPos({ x, y });
  };

  return (
    <div 
      className="relative w-full h-[60vh] md:h-[75vh] cursor-crosshair overflow-hidden group"
      onPointerEnter={() => setShowLoupe(true)}
      onPointerLeave={() => setShowLoupe(false)}
      onPointerMove={handlePointerMove}
    >
      {/* Base Image */}
      <img src={src} alt={alt} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
      
      {/* Magnifier overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          backgroundImage: `url(${src})`,
          backgroundPosition: `${pos.x}% ${pos.y}%`,
          backgroundSize: '250%',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Loupe glass circle effect */}
      {showLoupe && (
        <div 
          className="absolute pointer-events-none w-48 h-48 border border-brand-accent/30 rounded-full shadow-2xl backdrop-blur-none z-20"
          style={{
            left: `calc(${pos.x}% - 6rem)`,
            top: `calc(${pos.y}% - 6rem)`,
            backgroundImage: `url(${src})`,
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            backgroundSize: '300%', // Slightly larger than overlay
          }}
        />
      )}
    </div>
  );
}
