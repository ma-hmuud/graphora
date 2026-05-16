"use client";

import { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width: number, height: number;
    let particles: Node[] = [];
    let animationFrameId: number;

    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 250, // Magnetic field radius
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    function resize() {
      if (!canvas || !container) return;
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
      
      // Re-initialize particles on resize
      particles = [];
      const nodeCount = Math.min(Math.floor((width * height) / 15000), 100);
      for (let i = 0; i < nodeCount; i++) {
        particles.push(new Node());
      }
    }

    class Node {
      x: number;
      y: number;
      baseVx: number;
      baseVy: number;
      vx: number;
      vy: number;
      centrality: number;
      radius: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseVx = (Math.random() - 0.5) * 0.8;
        this.baseVy = (Math.random() - 0.5) * 0.8;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.centrality = Math.random();
        this.radius = 2 + this.centrality * 6;
      }

      update() {
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            const pullStrength = force * 0.2 * (1 + this.centrality);

            this.vx += forceDirectionX * pullStrength;
            this.vy += forceDirectionY * pullStrength;
          }
        }

        this.vx = this.vx * 0.95 + this.baseVx * 0.05;
        this.vy = this.vy * 0.95 + this.baseVy * 0.05;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) {
          this.vx *= -1;
          this.baseVx *= -1;
          this.x = Math.max(0, Math.min(this.x, width));
        }
        if (this.y < 0 || this.y > height) {
          this.vy *= -1;
          this.baseVy *= -1;
          this.y = Math.max(0, Math.min(this.y, height));
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#6366F1";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#6366F1";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    window.addEventListener("resize", resize);
    resize();

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const opacity = (1 - dist / 180) * 0.25;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-80 pointer-events-none"
      />
    </div>
  );
}
