import React, { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !pass) { setError("Enter email and password"); return; }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {

  console.log(e);

  alert(e.code);

  const msg =
    e.code === "auth/invalid-credential" ||
    e.code === "auth/wrong-password"
      ? "Invalid email or password"
      : e.code === "auth/too-many-requests"
      ? "Too many attempts. Try again later."
      : "Login failed. Please try again.";

  setError(msg);

}
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-head">
          <div className="admin-icon">
            <i className="ti ti-lock" aria-hidden="true" />
          </div>
          <div>
            <div className="admin-title">Admin Login</div>
            <div className="admin-sub">Only for app owner / admin</div>
          </div>
        </div>

        <div className="admin-security">
          <i className="ti ti-shield-check" aria-hidden="true" />
          <span>Restricted area. Unauthorized access is logged and monitored.</span>
        </div>

        {error && (
          <div className="err-msg" style={{ marginBottom:12 }}>
            <i className="ti ti-alert-circle" aria-hidden="true" /> {error}
          </div>
        )}

        <div className="admin-fg">
          <label><i className="ti ti-mail" aria-hidden="true" />Email address</label>
          <input
            type="email"
            placeholder="admin@yourdomain.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="admin-fg" style={{ position:"relative" }}>
          <label><i className="ti ti-key" aria-hidden="true" />Password</label>
          <input
            type={show ? "text" : "password"}
            placeholder="Your password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            autoComplete="current-password"
            style={{ paddingRight:38 }}
          />
          <button
            onClick={() => setShow(s => !s)}
            style={{ position:"absolute", right:10, bottom:10, background:"none", border:"none", cursor:"pointer", color:"#9aa3af", padding:0 }}
            aria-label={show ? "Hide password" : "Show password"}
          >
            <i className={`ti ti-${show ? "eye-off" : "eye"}`} style={{ fontSize:16 }} />
          </button>
        </div>

        <button className="admin-btn" onClick={login} disabled={loading}>
          {loading ? "Logging in..." : "Login to Dashboard"}
        </button>

        <div className="admin-footer">
          <i className="ti ti-lock" style={{ fontSize:11 }} aria-hidden="true" />
          Local Workers App · Secure admin access
        </div>
      </div>
    </div>
  );
}