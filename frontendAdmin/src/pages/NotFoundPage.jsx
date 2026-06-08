import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Home, LayoutDashboard } from "lucide-react";

const NotFoundPage = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width, height;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      const scale = window.devicePixelRatio || 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(scale, scale);
      init();
    };

    let mouse = { x: null, y: null, radius: 180 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", resize);

    const teal = "20, 184, 166";
    const orange = "255, 109, 52";

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.color = Math.random() > 0.4 ? teal : orange;
      }
      draw() {
        ctx.fillStyle = `rgba(${this.color}, 0.8)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.color}, 0.8)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -20) this.vx = Math.abs(this.vx);
        if (this.x > width + 20) this.vx = -Math.abs(this.vx);
        if (this.y < -20) this.vy = Math.abs(this.vy);
        if (this.y > height + 20) this.vy = -Math.abs(this.vy);

        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${this.color}, ${0.5 - (distance / mouse.radius) * 0.5})`;
            ctx.lineWidth = 1;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 1.5;
            this.y -= forceDirectionY * force * 1.5;
          }
        }
      }
    }

    let particles = [];
    const init = () => {
      particles = [];
      for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
      }
    };

    const connect = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            const opacity = 1 - distance / 120;
            ctx.strokeStyle = `rgba(${particles[a].color}, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0B1120]">

      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto z-0"
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-8">

        {/* Animated Bot */}
        <div className="relative mb-8 flex items-center justify-center group">
          <div className="absolute inset-0 bg-black/50 blur-[50px] rounded-full" />
          <div className="absolute w-36 h-36 border-2 border-teal-500/30 border-dashed rounded-full animate-[spin_8s_linear_infinite]" />
          <div className="absolute w-52 h-52 border border-teal-500/20 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="relative z-10 flex items-center justify-center">
            {/* Outer glow pulse */}
            <div className="absolute w-24 h-24 bg-teal-500/10 rounded-full animate-ping"
                style={{ animationDuration: "2s" }} />
            {/* Inner glow */}
            <div className="absolute w-16 h-16 bg-teal-500/20 rounded-full animate-pulse" />
            {/* Bot icon */}
            <Bot
            className="w-20 h-20 text-teal-500 relative z-10
            drop-shadow-[0_0_30px_rgba(20,184,166,0.8)]
            bot-blink"
            />
             </div>
         </div>

        {/* 404 */}
        <h1 className="text-[7rem] lg:text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-500 via-teal-400 to-[#ff6d34] leading-none tracking-tighter mb-4 drop-shadow-[0_0_40px_rgba(20,184,166,0.3)]">
          404
        </h1>

        {/* Title */}
        <h2 className="text-xl lg:text-2xl font-black text-main uppercase tracking-widest mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-muted text-sm lg:text-base leading-relaxed max-w-md font-medium mb-10">
          Oops! This admin page doesn't exist or has been moved.
          Use the options below to navigate to a valid page.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-teal-500/10 border border-teal-500/50 text-teal-400 font-bold transition-all duration-300 hover:bg-teal-500 hover:text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:border-teal-400 active:scale-95 uppercase tracking-wider text-xs overflow-hidden"
          >
            <LayoutDashboard className="w-4 h-4 group-hover:animate-bounce relative z-10" />
            <span className="relative z-10">Go to Dashboard</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-border text-muted font-bold transition-all duration-300 hover:bg-canvas-alt hover:text-main hover:scale-105 active:scale-95 uppercase tracking-wider text-xs"
          >
            <Home className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Go Back</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;