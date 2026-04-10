import React, { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
  if (!email || !pass) {
    setError("Enter email and password");
    return;
  }

  setLoading(true);
  setError("");

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    console.log("Login success");
  } catch (e) {
    console.log("Firebase Error:", e);
    setError(e.message);
  }

  setLoading(false);
};

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🔒</div>
        <h2>Admin Login</h2>
        <p>Only for app owner / admin</p>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="admin@yourdomain.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Your password" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()} />
        </div>

        <button className="login-btn" onClick={login} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
