import React, { useState, useEffect } from "react";
import "./index.css";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import FindWorkers from "./pages/FindWorkers";
import RegisterWorker from "./pages/RegisterWorker";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import UpgradeModal from "./components/UpgradeModal";

export default function App() {
  const [tab, setTab] = useState("find");
  const [adminUser, setAdminUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
      setCheckingAuth(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShowInstall(false);
    }
  };

  if (checkingAuth) return <div className="loading">Loading...</div>;
  if (tab === "admin" && !adminUser) return <AdminLogin onLogin={() => {}} />;

  return (
    <div className="app-shell">
      {showInstall && (
        <div className="install-bar">
          <div>
            <strong>Add to your home screen</strong>
            <span>Works like an app — no Play Store needed</span>
          </div>
          <button className="install-btn" onClick={handleInstall}>Install</button>
        </div>
      )}

      <div className="hdr">
        <div className="hdr-ic">🔧</div>
        <div>
          <h1>Local Workers / స్థానిక పనివారు</h1>
          <small>Verified local workers • Safe &amp; trusted</small>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${tab === "find" ? "active" : ""}`} onClick={() => setTab("find")}>
          Find Worker<br /><span style={{ fontSize: 9 }}>వెతకండి</span>
        </div>
        <div className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>
          Register as Worker (Free)<br /><span style={{ fontSize: 9 }}>నమోదు చేయండి</span>
        </div>
        <div className={`tab ${tab === "admin" ? "active" : ""}`} onClick={() => setTab("admin")}>
          Admin
        </div>
      </div>

      <div className="content">
        {tab === "find" && <FindWorkers onUpgrade={() => setUpgradeModal(true)} />}
        {tab === "register" && <RegisterWorker />}
        {tab === "admin" && adminUser && <AdminPanel />}
      </div>

      {upgradeModal && <UpgradeModal onClose={() => setUpgradeModal(false)} />}
    </div>
  );
}
