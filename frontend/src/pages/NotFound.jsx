import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bot, Home } from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

const NotFound = () => {
    const { isAuthenticated } = useAuth();
    const canvasRef = useRef(null);
    const homeLink = isAuthenticated ? "/dashboard" : "/";

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width, height;

        // Keep responsive scaling so it doesn't break on Retina/Mobile screens
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
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
            mouse.x = e.x;
            mouse.y = e.y;
        };
        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };
        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleMouseLeave);

        const teal = '20, 184, 166'; // teal-500
        const orange = '255, 109, 52'; // #ff6d34

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;

                const speedFactor = width < 768 ? 0.4 : 0.8;
                this.vx = (Math.random() - 0.5) * 1.5 * speedFactor;
                this.vy = (Math.random() - 0.5) * 1.5 * speedFactor;

                this.color = Math.random() > 0.4 ? teal : orange;
            }
            draw() {
                ctx.fillStyle = `rgba(${this.color}, 0.8)`;

                // Original Premium Glow Effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${this.color}, 0.8)`;

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();

                // Reset shadow so lines don't get blurred/buggy
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
            const isMobile = width < 768;
            let numberOfParticles = isMobile ? 40 : 120; // Original high density

            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const connect = () => {
            const maxDistance = width < 768 ? 100 : 120;

            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = 1 - (distance / maxDistance);
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
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
            <Header />

            {/* Interactive Canvas Background - Full opacity like the original Idea 1 */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 pointer-events-none"
            />

            {/* Subtle Grid overlay */}
            <div className="absolute inset-0 opacity-40 dark:opacity-10 pointer-events-none z-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 pt-[4.5rem] pointer-events-none">
                <div className="text-center max-w-2xl mx-auto flex flex-col items-center mt-[-2rem]">

                    {/* Dark AI Core Animation */}
                    <div className="relative mb-8 md:mb-12 flex items-center justify-center pointer-events-auto group scale-75 md:scale-100">
                        {/* Dark blur effect */}
                        <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/50 blur-[50px] rounded-full transition-colors duration-700"></div>

                        {/* Dark Core Rings */}
                        <div className="absolute w-36 h-36 md:w-40 md:h-40 border-2 border-slate-800 dark:border-slate-700 border-dashed rounded-full animate-[spin_8s_linear_infinite]"></div>
                        <div className="absolute w-52 h-52 md:w-56 md:h-56 border border-slate-800/50 dark:border-slate-700/50 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>

                        {/* Bot floating freely without background */}
                        <div className="relative z-10 flex items-center justify-center cursor-crosshair">
                            <Bot className="w-20 h-20 md:w-24 md:h-24 text-teal-500 drop-shadow-[0_0_25px_rgba(20,184,166,0.6)] animate-bounce" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>

                    <h1 className="text-[5rem] md:text-[6rem] lg:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-500 via-teal-400 to-[#ff6d34] leading-none tracking-tighter mb-2 md:mb-4 drop-shadow-[0_0_40px_rgba(20,184,166,0.2)]">
                        404
                    </h1>

                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-teal-50 mb-4 md:mb-6 uppercase tracking-widest px-4">
                        Page Not Found
                    </h2>

                    <p className="text-slate-600 dark:text-teal-100/70 mb-8 md:mb-12 text-sm md:text-lg leading-relaxed max-w-xs md:max-w-lg font-medium px-4">
                        Oops! The page you are looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
                        <Link
                            to={homeLink}
                            className="group relative inline-flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 rounded-2xl bg-teal-500/10 border border-teal-500/50 text-teal-700 dark:text-teal-300 font-bold transition-all duration-300 hover:bg-teal-500 hover:text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:border-teal-400 active:scale-95 uppercase tracking-wider text-xs md:text-sm overflow-hidden"
                        >
                            <Home className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-bounce relative z-10" />
                            <span className="relative z-10">Go Home</span>

                            {/* Scanning line effect on button hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};
export default NotFound;
