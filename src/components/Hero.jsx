import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    const numParticles = 80;
    let mouse = { x: null, y: null };

    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Track mouse
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce from edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Interaction with mouse
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          this.x += dx / dist;
          this.y += dy / dist;
        }

        this.draw();
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(100, 200, 255, 0.7)";
        ctx.fill();
      }
    }

    // Init particles
    const init = () => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };
    init();

    // Animate
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => p.update());
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative bg-[var(--color-bg)] text-[var(--color-fg)] overflow-hidden">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Master <span className="text-[var(--color-primary)]">AI/ML</span>{" "}
            <br />
            with Challenges &{" "}
            <span className="text-[var(--color-accent)]">Leaderboards</span>
          </h1>
          <p className="text-lg text-[var(--color-fg)] max-w-xl mx-auto lg:mx-0">
            Sharpen your skills, solve real-world problems, and climb the
            leaderboard. Join a vibrant coding community built for growth and
            success.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            <Link
              to="/problems"
              className="px-6 py-3 bg-[var(--color-gray)] border-1 rounded-3xl text-[var(--color-fg)] font-medium shadow-md hover:opacity-90 transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="hidden lg:flex flex-1 justify-center lg:justify-end">
          <div className="relative w-80 h-80 lg:w-[28rem] lg:h-[28rem]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)] opacity-30 blur-3xl"></div>
            <div className="relative w-full h-full flex items-center justify-center rounded-full bg-[var(--color-muted)] border border-[var(--color-border)] shadow-lg">
              <span className="text-5xl font-bold text-[var(--color-primary)]">
                {"</>"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
