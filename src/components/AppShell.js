import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/",         icon: "ti-home",  label: "Home"     },
  { path: "/services", icon: "ti-tool",  label: "Services" },
  { path: "/register", icon: "ti-plus",  label: "Register" },
  { path: "/admin",    icon: "ti-user",  label: "Admin"    },
];

const TABS = [
  { path: "/",         label: "Find Worker", tel: "వెతకండి" },
  { path: "/register", label: "Register",    tel: "నమోదు"   },
  { path: "/admin",    label: "Admin",       tel: ""         },
];

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .lw-hdr {
    position: relative;
    overflow: hidden;
    background: linear-gradient(140deg, #052e16 0%, #064e27 35%, #0a6640 65%, #0d7a4a 100%);
    padding: 26px 20px 28px;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.06) inset,
      0 8px 40px rgba(5,46,22,0.55),
      0 2px 8px rgba(0,0,0,0.3);
  }
  .lw-hdr-s1 {
    position: absolute; width: 220px; height: 220px; border-radius: 50%;
    top: -80px; right: -60px;
    background: radial-gradient(circle, rgba(52,211,153,0.13) 0%, transparent 70%);
    pointer-events: none;
  }
  .lw-hdr-s2 {
    position: absolute; width: 140px; height: 140px; border-radius: 50%;
    bottom: -50px; left: -40px;
    background: rgba(52,211,153,0.06);
    border: 1px solid rgba(52,211,153,0.08);
    pointer-events: none;
  }
  .lw-hdr-s3 {
    position: absolute; width: 70px; height: 70px; border-radius: 50%;
    top: 10px; right: 80px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    pointer-events: none;
  }
  .lw-hdr-inner {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 16px;
  }
  .lw-capsule {
    width: 60px; height: 60px; border-radius: 20px; flex-shrink: 0;
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.30);
    box-shadow:
      0 0 24px rgba(255,255,255,0.08),
      0 4px 16px rgba(0,0,0,0.25),
      0 1px 0 rgba(255,255,255,0.22) inset;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    position: relative;
  }
  .lw-capsule img {
    width: 44px; height: 44px; border-radius: 12px;
    object-fit: cover; display: block;
  }
  .lw-capsule::after {
    content: ""; position: absolute; inset: 0; border-radius: 20px;
    background: linear-gradient(145deg, rgba(255,255,255,0.16) 0%, transparent 55%);
    pointer-events: none;
  }
  .lw-brand-name {
    margin: 0;
    font-size: 30px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -1.5px;
    line-height: 1;
    text-shadow: 0 2px 12px rgba(0,0,0,0.3);
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .lw-brand-name em {
    color: #16a34a;
    font-style: normal;
    font-weight: 800;
  }
  .lw-brand-tag {
    font-size: 10px;
    color: rgba(247, 247, 247, 0.76);
    margin-top: 5px;
    letter-spacing: 0.18em;
    line-height: 1.4;
    text-transform: uppercase;
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 600;
  }
  .lw-pill {
    position: absolute; top: 20px; right: 18px; z-index: 2;
    display: flex; align-items: center; gap: 5px;
    background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.28);
    border-radius: 20px; padding: 5px 10px;
  }
  .lw-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,0.9); flex-shrink: 0;
  }
  .lw-pill-txt {
    font-size: 11px; color: rgba(255,255,255,0.85); font-weight: 600;
    letter-spacing: 0.04em; white-space: nowrap;
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .lw-shine {
    position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(52,211,153,0.22) 40%,
      rgba(52,211,153,0.38) 50%, rgba(52,211,153,0.22) 70%, transparent);
  }
`;

export default function AppShell({ children }) {
  const navigate    = useNavigate();
  const location    = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="app-shell">
      <style>{S}</style>

      <header className="lw-hdr">
        <div className="lw-hdr-s1" aria-hidden="true" />
        <div className="lw-hdr-s2" aria-hidden="true" />
        <div className="lw-hdr-s3" aria-hidden="true" />
        <div className="lw-pill" aria-hidden="true">
          <div className="lw-dot" />
          <span className="lw-pill-txt">Verified</span>
        </div>
        <div className="lw-hdr-inner">
          <div className="lw-capsule">
            <img src="/logo192.png" alt="LocalWala logo" />
          </div>
          <div>
            <h1 className="lw-brand-name">Local<em>Wala</em></h1>
            <p className="lw-brand-tag">మీ ఇంటి పనులను సులభంగా పూర్తి చేసుకోండి</p>
          </div>
        </div>
        <div className="lw-shine" aria-hidden="true" />
      </header>

      <nav className="tabs" role="tablist" aria-label="Main sections" style={{ padding: "0 10px" }}>
        {TABS.map((t) => (
          <button
            key={t.path} role="tab"
            aria-selected={currentPath === t.path}
            className={`tab${currentPath === t.path ? " active" : ""}`}
            onClick={() => navigate(t.path)}
            style={{ padding: "10px 12px", borderRadius: 14 }}
          >
            {t.label}
            {t.tel && <small className="tab-tel" style={{ fontSize: 10 }}>{t.tel}</small>}
          </button>
        ))}
      </nav>

      <main className="main-content" style={{ paddingBottom: 90 }}>{children}</main>

      <nav className="bottom-nav" aria-label="Main navigation" style={{ height: 68 }}>
        {NAV_ITEMS.map((n) => (
          <button
            key={n.path}
            className={`bni${currentPath === n.path ? " active" : ""}`}
            onClick={() => navigate(n.path)}
            aria-label={n.label} style={{ fontSize: 11 }}
          >
            <i className={`ti ${n.icon}`} aria-hidden="true" style={{ fontSize: 18 }} />
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}