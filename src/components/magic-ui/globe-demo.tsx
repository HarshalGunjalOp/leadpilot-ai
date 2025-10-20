"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function GlobeDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple animated globe visualization
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    let rotation = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw globe
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw rotating lines
      for (let i = 0; i < 12; i++) {
        const angle = ((Math.PI * 2) / 12) * i + rotation;
        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
        ctx.lineTo(
          centerX + Math.cos(angle + Math.PI) * radius,
          centerY + Math.sin(angle + Math.PI) * radius
        );
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 + Math.abs(Math.sin(angle)) * 0.2})`;
        ctx.stroke();
      }

      rotation += 0.005;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-[400px] w-[400px]"
    >
      <canvas ref={canvasRef} width={400} height={400} className="opacity-80" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl" />
    </motion.div>
  );
}
