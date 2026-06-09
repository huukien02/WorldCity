"use client";

import { useEffect, useRef } from "react";
import { useWeather } from "../hooks/useWeather";
import { WEATHER_CONFIG } from "../types";

interface WeatherLayerProps {
  width: number;
  height: number;
}

interface Particle {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  opacity: number;
  swing: number; // phase cho tuyết đung đưa
}

const PARTICLE_COUNT = {
  rain: 120,
  storm: 220,
  snow: 70,
  fog: 0,
  sunny: 0,
};

function makeParticles(count: number, w: number, h: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    speedY: 2 + Math.random() * 3,
    speedX: 0,
    size: 1 + Math.random() * 1.5,
    opacity: 0.4 + Math.random() * 0.4,
    swing: Math.random() * Math.PI * 2,
  }));
}

export function WeatherLayer({ width, height }: WeatherLayerProps) {
  const { type } = useWeather();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lightningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lightningOpacityRef = useRef(0);
  const config = WEATHER_CONFIG[type];
  const count = PARTICLE_COUNT[type] ?? 0;

  // Reset particles khi thời tiết đổi
  useEffect(() => {
    particlesRef.current = makeParticles(count, width, height);
  }, [type, count, width, height]);

  // Lightning timer cho bão
  useEffect(() => {
    if (type !== "storm") {
      lightningOpacityRef.current = 0;
      if (lightningTimerRef.current) clearTimeout(lightningTimerRef.current);
      return;
    }

    function scheduleFlash() {
      lightningTimerRef.current = setTimeout(
        () => {
          lightningOpacityRef.current = 0.35;
          setTimeout(() => {
            lightningOpacityRef.current = 0;
            scheduleFlash();
          }, 150);
        },
        2500 + Math.random() * 4000,
      );
    }

    scheduleFlash();
    return () => {
      if (lightningTimerRef.current) clearTimeout(lightningTimerRef.current);
    };
  }, [type]);

  // Animation loop trên canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Overlay màu nền theo thời tiết
      if (config.overlayOpacity > 0) {
        ctx.fillStyle = config.overlayColor;
        ctx.globalAlpha = config.overlayOpacity;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }

      // Lightning flash
      if (lightningOpacityRef.current > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = lightningOpacityRef.current;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }

      const particles = particlesRef.current;
      const isSnow = type === "snow";
      const isStorm = type === "storm";

      for (const p of particles) {
        // Update vị trí
        if (isSnow) {
          p.swing += 0.02;
          p.y += p.speedY * 0.4;
          p.x += Math.sin(p.swing) * 0.6;
        } else {
          p.y += p.speedY * (isStorm ? 2.2 : 1.2);
          p.x += isStorm ? 2 : 0.4;
        }

        // Wrap around
        if (p.y > canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 10) {
          p.x = -10;
        }

        // Vẽ particle
        ctx.globalAlpha = p.opacity;
        if (isSnow) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = "#e0f2fe";
          ctx.fill();
        } else {
          // Mưa: hình chữ nhật mỏng dài
          ctx.fillStyle = isStorm ? "#93c5fd" : "#bfdbfe";
          ctx.fillRect(p.x, p.y, p.size * 0.7, p.size * 7);
        }
        ctx.globalAlpha = 1;
      }

      frame++;
      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [type, config]);

  // Không render gì nếu thời tiết nắng và không có overlay
  if (type === "sunny") return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}
