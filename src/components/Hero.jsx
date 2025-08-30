// Hero.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../stores/authStore";

/**
 * Hero with dotted background:
 *  - same-size / same-color dots
 *  - smooth position-based parallax (follows pointer direction slowly)
 *  - morphs into a circular arrangement when hovering the Get Started button
 *  - dotted SVG ring that fades in when circle mode is active
 */
const Hero = () => {
  const { user } = useContext(AuthContext);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const roRef = useRef(null);

  // particle store
  const particlesRef = useRef([]);
  // parallax offset (eased)
  const offsetRef = useRef({ x: 0, y: 0 });
  // last pointer position relative to container
  const pointerPosRef = useRef({ x: null, y: null, inside: false });
  // whether circle morph is active (state)
  const [circleMode, setCircleMode] = useState(false);
  // mirror state into a ref so the animation closure can read latest value
  const circleModeRef = useRef(circleMode);

  // constants for appearance
  const DOT_COLOR_RGB = "255,255,255"; // r,g,b - single color for all dots
  const DOT_RADIUS = 2.1; // identical radius for all particles
  const DOT_ALPHA = 0.9; // identical alpha for all particles

  // update ref whenever circleMode changes so main animation sees it
  useEffect(() => {
    circleModeRef.current = circleMode;
  }, [circleMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      console.warn("2D canvas context not available");
      return;
    }

    let dpr = Math.max(1, window.devicePixelRatio || 1);

    // safe resize and transform setup to avoid DOMMatrixInit errors
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.max(1, window.devicePixelRatio || 1);

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${Math.floor(rect.width)}px`;
      canvas.style.height = `${Math.floor(rect.height)}px`;

      // Try to set transform safely:
      try {
        if (typeof ctx.resetTransform === "function") {
          ctx.resetTransform();
          ctx.scale(dpr, dpr);
        } else if (typeof ctx.setTransform === "function") {
          // some runtimes may validate setTransform differently; wrap in try/catch
          try {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          } catch (err) {
            try {
              ctx.setTransform(1, 0, 0, 1, 0, 0);
              ctx.scale(dpr, dpr);
            } catch (err2) {
              // fallback to scale (may multiply transforms but prevents crash)
              try {
                ctx.scale(dpr, dpr);
              } catch (err3) {
                console.warn("canvas transform fallback failed", err3);
              }
            }
          }
        } else if (typeof ctx.scale === "function") {
          ctx.scale(dpr, dpr);
        }
      } catch (err) {
        // final fallback
        try {
          ctx.scale(dpr, dpr);
        } catch (ignored) {}
      }
    };

    // create a regular grid of particles
    const initParticles = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width * 1.25;
      const h = rect.height * 1.25;

      // spacing controls density (lower spacing => more dots)
      const spacing = Math.max(28, Math.floor(Math.min(w, h) / 18));
      const jitter = spacing * 0.05;

      const cols = Math.ceil(w / spacing) + 2;
      const rows = Math.ceil(h / spacing) + 2;
      const arr = [];
      let idx = 0;
      for (let r = -1; r < rows - 1; r++) {
        for (let c = -1; c < cols - 1; c++) {
          const baseX =
            c * spacing +
            spacing / 2 +
            (w - cols * spacing) / 2 +
            (Math.random() - 0.5) * jitter;
          const baseY =
            r * spacing +
            spacing / 2 +
            (h - rows * spacing) / 2 +
            (Math.random() - 0.5) * jitter;
          arr.push({
            idx: idx++,
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            // same radius and alpha for all particles
            radius: DOT_RADIUS,
            alpha: DOT_ALPHA,
            targetX: baseX,
            targetY: baseY,
            isCircleTargetsSet: false,
          });
        }
      }
      particlesRef.current = arr;
    };

    // compute circle targets for morph
    const computeCircleTargets = () => {
      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rad = Math.min(rect.width, rect.height) * 0.58; // radius
      const len = particlesRef.current.length;
      // map evenly around circle; keep a tiny jitter to avoid perfect mechanical dots
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const angle = t * Math.PI * 2;
        const jitterR = (Math.random() - 0.5) * 5; // small radial jitter
        const px = cx + (rad ) * Math.cos(angle);
        const py = cy + (rad) * Math.sin(angle);
        particlesRef.current[i].targetX = px;
        particlesRef.current[i].targetY = py;
      }
    };

    const resetTargetsToBase = () => {
      for (const p of particlesRef.current) {
        p.targetX = p.baseX;
        p.targetY = p.baseY;
      }
    };

    // initial sizing & particles
    resizeCanvas();
    initParticles();

    // pointer handling (store pointer pos inside container)
    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      pointerPosRef.current.x = e.clientX - rect.left;
      pointerPosRef.current.y = e.clientY - rect.top;
      pointerPosRef.current.inside = true;
    };
    const onPointerLeave = () => {
      pointerPosRef.current.inside = false;
    };
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave, { passive: true });
    container.addEventListener("pointercancel", onPointerLeave, { passive: true });

    // ResizeObserver: resize canvas + re-init particles; recompute circle targets if needed
    const ro = new ResizeObserver(() => {
      resizeCanvas();
      initParticles();
      if (circleModeRef.current) {
        computeCircleTargets();
        particlesRef.current.forEach((p) => (p.isCircleTargetsSet = true));
      } else {
        // ensure base targets
        resetTargetsToBase();
        particlesRef.current.forEach((p) => (p.isCircleTargetsSet = false));
      }
    });
    ro.observe(container);
    roRef.current = ro;

    // animation loop
    let lastTs = performance.now();

    const tick = (ts) => {
      const dt = Math.max(0.6, Math.min(2.5, (ts - lastTs) / (1000 / 60)));
      lastTs = ts;

      // clear canvas
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // if circleMode is active (read from ref), ensure targets are computed
      if (circleModeRef.current) {
        if (!particlesRef.current[0]?.isCircleTargetsSet) {
          computeCircleTargets();
          particlesRef.current.forEach((p) => (p.isCircleTargetsSet = true));
        }
      } else {
        if (particlesRef.current[0]?.isCircleTargetsSet) {
          resetTargetsToBase();
          particlesRef.current.forEach((p) => (p.isCircleTargetsSet = false));
        }
      }

      // PARALLAX: position-based, follows pointer relative to center,
      // eased so movement is smooth and slow
      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const ptr = pointerPosRef.current;
      const PARALLAX_FACTOR = 0.03; // how strongly pointer offset affects target
      const EASE = 0.08; // easing for offset towards target

      let targetOffX = 0;
      let targetOffY = 0;
      if (ptr.inside && ptr.x !== null) {
        targetOffX = (ptr.x - cx) * PARALLAX_FACTOR;
        targetOffY = (ptr.y - cy) * PARALLAX_FACTOR;
      }
      // ease current offset towards target
      offsetRef.current.x += (targetOffX - offsetRef.current.x) * EASE;
      offsetRef.current.y += (targetOffY - offsetRef.current.y) * EASE;

      const offX = offsetRef.current.x;
      const offY = offsetRef.current.y;

      // draw every particle, lerping toward target for smooth circle morph
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];

        const targetX = p.targetX;
        const targetY = p.targetY;

        // lerp factor depends on mode: slightly faster when morphing into circle
        const lerpFactor = circleModeRef.current ? 0.025 : 0.025;

        p.x += (targetX - p.x) * lerpFactor;
        p.y += (targetY - p.y) * lerpFactor;


        const drawX = p.x + offX;
        const drawY = p.y + offY;

        ctx.beginPath();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `rgba(${DOT_COLOR_RGB},1)`;
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (roRef.current) roRef.current.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointercancel", onPointerLeave);
    };
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When circleMode toggles we don't need to call computeCircleTargets from outside
  // because the animation loop detects circleModeRef.current and computes there.
  // However, update circleModeRef so the loop sees the change immediately.
  useEffect(() => {
    circleModeRef.current = circleMode;
  }, [circleMode]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[var(--color-bg-black)] text-white min-h-[72vh] lg:min-h-screen flex items-center"
      aria-label="Hero"
    >
      {/* canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      />

      {/* content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <h1 className="font-bold text-[4.2rem] leading-[0.9] lg:text-[6rem] lg:leading-[0.88] tracking-tight">
          <span className="inline-block mr-2">Clear-</span>
          <span className="inline-block">Signal</span>
          <span
            className="inline-block min-w-3 min-h-22 rounded-sm align-middle ml-3 bg-slate-400/50 animate-pulse "
          />
        </h1>

        <p className="mt-6 max-w-xl text-[1.1rem] text-sky-300/90 font-medium tracking-wide">
          Practice Machine Learning and Data Science
          <br />
          problems
        </p>

        <div className="mt-12">
          {/* Button: hovering this button toggles circle mode */}
          <Link
            to={user ? "/problems" : "/sign-in"}
            onPointerEnter={() => setCircleMode(true)}
            onPointerLeave={() => setCircleMode(false)}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-white/30 bg-[var(--color-bg-black)]/60 text-white font-semibold text-lg transition-transform transform hover:scale-105 hover:bg-white/10 duration-300 shadow-md"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
