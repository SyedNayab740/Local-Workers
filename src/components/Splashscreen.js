import { useEffect, useState, useRef } from 'react';
import '../styles/splash.css';

export default function SplashScreen({ onComplete }) {
  const [exiting, setExiting] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2800);
    const doneTimer = setTimeout(() => onComplete(), 3500);
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.6,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      o: Math.random() * 0.45 + 0.08,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(22,163,74,${p.o})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className={`splash-screen${exiting ? ' exit' : ''}`}
      aria-label="LocalWala — loading"
      role="status"
    >
      <div className="splash-bg" aria-hidden="true">
        <div className="splash-concentric-rings" />
        <div className="splash-mesh splash-mesh-1" />
        <div className="splash-mesh splash-mesh-2" />
        <div className="splash-mesh splash-mesh-3" />
        <div className="splash-dot-grid" />
        <div className="splash-hline splash-hline-1" />
        <div className="splash-hline splash-hline-2" />
        <div className="splash-orb splash-orb-1" />
        <div className="splash-orb splash-orb-2" />
        <div className="splash-orb splash-orb-3" />
        <div className="splash-orb splash-orb-4" />
        <canvas ref={canvasRef} className="splash-particles" />
      </div>

      <div className="splash-phone">
        <div className="splash-phone-inner">
          <div className="splash-glow-ring" aria-hidden="true" />

          {/* Bare logo — no card, no container */}
          <div className="splash-icon-wrap">
            <img src="/logo512.png" alt="LocalWala" className="splash-logo" />
          </div>

          {/* Name + taglines */}
          <div className="splash-name-row">
            <div className="splash-name" aria-label="LocalWala">
              Local<em>Wala</em>
            </div>
            <div className="splash-divider" aria-hidden="true" />
            <div className="splash-tagline-en">Worker Marketplace</div>
          </div>

          <div className="splash-progress-wrap">
            <div className="splash-progress-track">
              <div className="splash-progress-fill" />
            </div>
            <div className="splash-progress-label" aria-live="polite"></div>
          </div>

          <div className="splash-bottom" aria-hidden="true">
            <div className="splash-rule" />
            <span className="splash-bottom-text">trusted since 2024</span>
            <div className="splash-rule" />
          </div>
        </div>
      </div>
    </div>
  );
}