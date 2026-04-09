import React, { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection, query, where, onSnapshot, doc, updateDoc,
  serverTimestamp, orderBy, getDocs
} from "firebase/firestore";
import { signOut } from "firebase/auth";

function trialDaysLeft(approvedAt) {
  if (!approvedAt) return 0;
  const approved = approvedAt.toDate ? approvedAt.toDate() : new Date(approvedAt);
  const diff = 7 - Math.floor((Date.now() - approved.getTime()) / 86400000);
  return Math.max(0, diff);
}

export default function AdminPanel() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const q1 = query(collection(db, "workers"), where("status", "==", "pending"));
    const unsub1 = onSnapshot(q1, snap => setPending(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const q2 = query(collection(db, "workers"), where("status", "==", "approved"), orderBy("isPaid", "desc"));
    const unsub2 = onSnapshot(q2, snap => setApproved(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const q3 = query(collection(db, "payments"), where("confirmed", "==", false), orderBy("createdAt", "desc"));
    const unsub3 = onSnapshot(q3, snap => setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const approveWorker = async (id) => {
    await updateDoc(doc(db, "workers", id), {
      status: "approved",
      approvedAt: serverTimestamp(),
    });
  };

  const rejectWorker = async (id) => {
    await updateDoc(doc(db, "workers", id), { status: "rejected" });
  };

  const confirmPayment = async (payment) => {
    await updateDoc(doc(db, "payments", payment.id), { confirmed: true });
    await updateDoc(doc(db, "workers", payment.workerId), {
      isPaid: true,
      paidUntil: new Date(Date.now() + 30 * 86400000),
    });
    alert(`Payment confirmed for ${payment.workerName}. They are now a paid member.`);
  };

  const paid = approved.filter(w => w.isPaid);
  const totalAdRevenue = 800; // update as you add real advertisers
  const workerRevenue = paid.length * 49;
  const totalRevenue = workerRevenue + totalAdRevenue;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>Admin Dashboard</span>
        <button
          onClick={() => signOut(auth)}
          style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#6b7280" }}>
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="num">{approved.length}</div>
          <div className="lbl">Workers</div>
        </div>
        <div className="stat-card">
          <div className="num" style={{ color: "#1D9E75" }}>{paid.length}</div>
          <div className="lbl">Paid ₹49</div>
        </div>
        <div className="stat-card">
          <div className="num" style={{ color: "#f59e0b" }}>{pending.length}</div>
          <div className="lbl">Pending</div>
        </div>
        <div className="stat-card">
          <div className="num" style={{ color: "#3b82f6" }}>{payments.length}</div>
          <div className="lbl">Pay queue</div>
        </div>
      </div>

      {/* Revenue */}
      <div className="revenue-box">
        <div className="rev-top">
          <div>
            <div className="rev-label">This month earnings</div>
            <div className="rev-amt">₹{totalRevenue.toLocaleString("en-IN")}</div>
          </div>
          <div className="rev-right">
            <div>Workers: ₹{workerRevenue}</div>
            <div>Ads: ₹{totalAdRevenue}</div>
          </div>
        </div>
        <div className="rev-goal">
          📈 Goal: ₹5,000/month → need {Math.ceil((5000 - totalAdRevenue) / 49)} paid workers + grow ad slots
        </div>
      </div>

      {/* Ad slots */}
      <p className="section-head">Ad slots (₹400/month each)</p>
      <div className="ad-slot-box">
        <div className="ad-slot-row">
          <div className="ad-dot dot-green"></div>
          <div style={{ flex: 1 }}>
            <div className="ad-name">Ravi Hardware Store</div>
            <div className="ad-meta">Top banner · Active</div>
          </div>
          <div className="ad-earn">₹400/mo</div>
        </div>
        <div className="ad-slot-row">
          <div className="ad-dot dot-green"></div>
          <div style={{ flex: 1 }}>
            <div className="ad-name">Kumar Auto Parts</div>
            <div className="ad-meta">Mid-feed · Active</div>
          </div>
          <div className="ad-earn">₹400/mo</div>
        </div>
        <div className="ad-slot-row">
          <div className="ad-dot dot-gray"></div>
          <div style={{ flex: 1 }}>
            <div className="ad-name">Slot 3 — available</div>
            <div className="ad-meta">Offer to local shops at ₹300–500/month</div>
          </div>
          <button className="add-slot-btn" onClick={() => alert("Visit nearby shops and offer them a sponsored slot.\n\nShow daily visitor count and offer ₹400/month.")}>
            Fill
          </button>
        </div>
      </div>

      {/* Payment confirmation queue */}
      {payments.length > 0 && (
        <>
          <p className="section-head">💰 Payment confirmations pending ({payments.length})</p>
          {payments.map(p => (
            <div key={p.id} className="payment-card">
              <div className="payment-top">
                <div className="payment-name">{p.workerName}</div>
                <span style={{ fontSize: 10, background: "#eff6ff", color: "#1e40af", padding: "2px 8px", borderRadius: 10 }}>₹49</span>
              </div>
              <div className="payment-meta">{p.utrNumber ? `UTR: ${p.utrNumber}` : "No UTR provided"} · {p.workerPhone}</div>
              <div className="payment-actions">
                <button className="btn-confirm" onClick={() => confirmPayment(p)}>Confirm Payment ✓</button>
                <button className="btn-reject" onClick={() => updateDoc(doc(db, "payments", p.id), { confirmed: true, rejected: true })}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Pending approvals */}
      {pending.length > 0 && (
        <>
          <p className="section-head">Pending approval ({pending.length})</p>
          {pending.map(w => (
            <div key={w.id} className="pending-card">
              <div className="pending-top">
                <div className="pending-name">{w.name}</div>
                <span className="new-badge">New</span>
              </div>
              <div className="pending-meta">
                {w.skill} · {w.area} · {w.experience} · {w.phone}
              </div>
              <div className="pending-actions">
                <button className="btn-approve" onClick={() => approveWorker(w.id)}>Approve ✓</button>
                <button className="btn-reject" onClick={() => rejectWorker(w.id)}>Reject</button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Workers & leads */}
      <p className="section-head">Workers &amp; leads today</p>
      <div className="workers-table">
        {approved.length === 0 && (
          <div className="empty-state" style={{ padding: 16 }}>
            <p>No approved workers yet.</p>
          </div>
        )}
        {approved.map(w => {
          const days = trialDaysLeft(w.approvedAt);
          let status = w.isPaid ? "Paid" : days > 0 ? `Trial ${days}d` : "Expired";
          let dotClass = w.isPaid ? "dot-green" : days > 0 ? "dot-yellow" : "dot-gray";
          return (
            <div key={w.id} className="worker-row">
              <div className={`ad-dot ${dotClass}`}></div>
              <div className="wr-info">
                <div className="wr-name">{w.name}</div>
                <div className="wr-meta">{w.skill} · {status}</div>
              </div>
              <div className="wr-leads">
                <div className="n">{w.leadsToday || 0} today</div>
                <small>{w.leadsTotal || 0} total</small>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: "12px", background: "#f9fafb", borderRadius: 8, fontSize: 11, color: "#9ca3af", lineHeight: 1.7 }}>
        <strong style={{ color: "#374151" }}>Leads reset tip:</strong> Reset leadsToday to 0 manually in Firebase console every morning, or set up a Cloud Function cron job for automatic daily reset.
      </div>
    </div>
  );
}
