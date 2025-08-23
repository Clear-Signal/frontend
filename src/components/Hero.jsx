import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Hero
 * - Canvas lives inside the hero region (not full-window)
 * - Particles follow pointer and are subtly repelled from it
 * - Colors are read from CSS variables so theme stays consistent
 */
const Hero = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    // read colors from CSS variables (falls back to hardcoded if missing)
    const style = getComputedStyle(document.documentElement);
    const BRAND = style.getPropertyValue("--brand")?.trim() || style.getPropertyValue("--color-primary")?.trim() || "#d9a200";
    const ACCENT = style.getPropertyValue("--accent")?.trim() || style.getPropertyValue("--color-accent")?.trim() || "#ff8a3d";
    const SURFACE2 = style.getPropertyValue("--card-bg-2")?.trim() || style.getPropertyValue("--color-surface-2")?.trim() || "#202227";
    const FG = style.getPropertyValue("--text-default")?.trim() || "#f5f5f5";

    let dpr = Math.max(1, window.devicePixelRatio || 1);

    // helper to size canvas to container
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${Math.floor(rect.width)}px`;
      canvas.style.height = `${Math.floor(rect.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas(); // initial

    // particle system tuned to area
    function createParticlesForArea(area) {
      // density factor: particles per 100k px^2
      const density = 0.0006; // tweaked for visuals/perf
      const targetCount = Math.max(24, Math.floor(area * density));
      const arr = [];
      for (let i = 0; i < targetCount; i++) arr.push(new Particle());
      return arr;
    }

    // basic random helpers
    const rand = (min, max) => Math.random() * (max - min) + min;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // Particle class
    function Particle() {
      // initialized later with actual size
      this.init = () => {
        const rect = container.getBoundingClientRect();
        this.x = rand(0, rect.width);
        this.y = rand(0, rect.height);
        this.radius = rand(0.9, 3.2);
        this.vx = rand(-0.25, 0.25);
        this.vy = rand(-0.25, 0.25);
        this.baseAlpha = rand(0.18, 0.9);
        // pick a subtle color mix from brand/accent/surface
        this.hueChoice = Math.random();
        // precompute a tiny gradient for nicer look (will be recreated on draw scale)
      };

      this.update = (dt) => {
        // basic movement
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // keep inside bounds softly
        const rect = container.getBoundingClientRect();
        if (this.x < -10) this.x = rect.width + 10;
        if (this.x > rect.width + 10) this.x = -10;
        if (this.y < -10) this.y = rect.height + 10;
        if (this.y > rect.height + 10) this.y = -10;

        // pointer interaction: gentle repulsion
        if (pointerRef.current.active) {
          const dx = this.x - pointerRef.current.x;
          const dy = this.y - pointerRef.current.y;
          const dist2 = dx * dx + dy * dy;
          const minR = 40;
          if (dist2 < 9000) {
            const dist = Math.sqrt(dist2) || 0.001;
            const force = clamp((100 - dist) / 100, -0.6, 1.2);
            // apply small push away from pointer
            this.vx += (dx / dist) * 0.02 * force;
            this.vy += (dy / dist) * 0.02 * force;
            //limit speeds
            this.vx = clamp(this.vx, -1.2, 1.2);
            this.vy = clamp(this.vy, -1.2, 1.2);
          }
        }

        // slight friction
        this.vx *= 0.995;
        this.vy *= 0.995;
      };

      this.draw = (ctx) => {
        // choose color — gradient between brand and accent, faint
        let color;
        if (this.hueChoice < 0.45) {
          color = `rgba(222, 163, 20, ${this.baseAlpha})`; // warm gold-ish fallback
        } else if (this.hueChoice < 0.75) {
          color = `rgba(255,140,61, ${this.baseAlpha})`; // orange-ish
        } else {
          color = `rgba(94, 200, 190, ${this.baseAlpha * 0.8})`; // teal-ish
        }

        // draw soft circle
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      };

      this.init();
    }

    // init particles
    const area = container.getBoundingClientRect().width * container.getBoundingClientRect().height;
    particlesRef.current = createParticlesForArea(area);

    // handle pointer events: pointermove covers mouse + touch
    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
      pointerRef.current.active = true;
    };
    const onPointerLeave = () => {
      pointerRef.current.active = false;
      // move pointer far away so particles eventually return to natural motion
      pointerRef.current.x = -9999;
      pointerRef.current.y = -9999;
    };

    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave, { passive: true });
    container.addEventListener("pointercancel", onPointerLeave, { passive: true });

    // ResizeObserver to resize canvas and re-create particle count on resize
    const ro = new ResizeObserver(() => {
      resizeCanvas();
      // re-create particles with new density
      const rect = container.getBoundingClientRect();
      particlesRef.current = createParticlesForArea(rect.width * rect.height);
    });
    ro.observe(container);

    // animation loop
    let lastTs = performance.now();
    const tick = (ts) => {
      const dt = clamp((ts - lastTs) / 16.67, 0.2, 2.2); // normalized to ~60FPS frame length
      lastTs = ts;

      // clear with subtle surface tint so particles look layered
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // slight overlay vignette for depth (optional subtle)
      ctx.save();
      // draw particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(dt);
        p.draw(ctx);
      }

      // optionally draw faint connecting lines for nearby particles (commented for perf)
      // drawLinks(ctx, particles);

      ctx.restore();

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // cleanup on unmount
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointercancel", onPointerLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[var(--bg-page)] text-[var(--text-default)]"
      aria-label="Hero"
    >
      {/* particle canvas that fills the hero container */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left space-y-6 z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Master <span className="text-[var(--brand)]">AI/ML</span>
            <br />
            with Challenges & <span className="text-[var(--accent)]">Leaderboards</span>
          </h1>

          <p className="text-lg text-[var(--text-fg)] max-w-xl mx-auto lg:mx-0">
            Sharpen your skills, solve real-world problems, and climb the leaderboard. Join a vibrant
            coding community built for learning and career growth.
          </p>

          <div className="flex justify-center lg:justify-start gap-4">
            <Link
              to="/problems"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--brand)] text-[var(--bg-page)] font-semibold shadow-lg hover:brightness-105 transition"
            >
              Get Started
            </Link>

            <Link
              to="/collections"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[var(--panel-border)] text-[var(--text-default)] bg-[var(--color-elevated)] hover:bg-[var(--color-gray)]/50 transition"
            >
              Browse Collections
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="hidden lg:flex flex-1 justify-center lg:justify-end z-10">
          <div className="relative w-72 h-72 lg:w-96 lg:h-96 rounded-full flex items-center justify-center bg-[var(--card-bg)] border border-[var(--panel-border)] shadow-2xl">
            <div className="absolute -inset-6 rounded-full blur-3xl opacity-40"
                 style={{ background: `radial-gradient(circle at 20% 30%, ${getComputedStyle(document.documentElement).getPropertyValue('--brand') || '#d9a200'} 0%, transparent 30%), radial-gradient(circle at 80% 70%, ${getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#ff8a3d'} 0%, transparent 28%)` }} />
            <div className="relative w-40 h-40 rounded-full bg-[var(--card-bg-2)] flex items-center justify-center border border-[var(--panel-border)]">
              <code className="text-6xl font-extrabold text-[var(--brand)]">{'</>'}</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
