import React, { useState, useEffect } from "react";

import { db, auth } from "../lib/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

import { signOut } from "firebase/auth";

function trialDaysLeft(approvedAt) {
  if (!approvedAt) return 0;
  const approved = approvedAt.toDate
    ? approvedAt.toDate()
    : new Date(approvedAt);
  const diff =
    7 -
    Math.floor((Date.now() - approved.getTime()) / 86400000);
  return Math.max(0, diff);
}

/* Mask first 8 digits: XXXX XXXX 9012 */
function maskAadhaar(aadhaar) {
  if (!aadhaar) return "—";
  const digits = String(aadhaar).replace(/\D/g, "");
  if (digits.length !== 12) return aadhaar;
  return `XXXX XXXX ${digits.slice(8)}`;
}

export default function AdminPanel() {

  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const q1 = query(
      collection(db, "workers"),
      where("status", "==", "pending")
    );
    const unsub1 = onSnapshot(q1, (snap) =>
      setPending(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const q2 = query(
      collection(db, "workers"),
      where("status", "==", "approved")
    );
    const unsub2 = onSnapshot(q2, (snap) =>
      setApproved(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const q3 = query(
      collection(db, "payments"),
      where("confirmed", "==", false),
      orderBy("createdAt", "desc")
    );
    const unsub3 = onSnapshot(q3, (snap) =>
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  /* APPROVE */
  const approveWorker = async (worker) => {
    try {
      await updateDoc(doc(db, "workers", worker.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
        isFeatured: worker.isFeatured || false,
        isPaid: worker.isPaid || false,
        leadsToday: worker.leadsToday || 0,
        leadsTotal: worker.leadsTotal || 0,
        callClicks: worker.callClicks || 0,
        whatsappClicks: worker.whatsappClicks || 0,
        profileViews: worker.profileViews || 0,
        rating: worker.rating || 0,
        jobCount: worker.jobCount || 0
      });
    } catch (e) {
      console.error("Approve error:", e);
      alert("Failed to approve worker.");
    }
  };

  /* REJECT */
  const rejectWorker = async (id) => {
    try {
      await updateDoc(doc(db, "workers", id), { status: "rejected" });
    } catch (e) {
      console.error("Reject error:", e);
      alert("Failed to reject worker.");
    }
  };

  /* REMOVE */
  const removeWorker = async (id) => {
    const ok = window.confirm("Are you sure you want to remove this worker?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "workers", id));
    } catch (err) {
      console.error("Remove error:", err);
      alert("Failed to remove worker.");
    }
  };

  /* FEATURE TOGGLE */
  const toggleFeatured = async (worker) => {
    try {
      await updateDoc(doc(db, "workers", worker.id), {
        isFeatured: !worker.isFeatured
      });
    } catch (e) {
      console.error("Feature toggle error:", e);
      alert("Failed to update featured status.");
    }
  };

  /* CONFIRM PAYMENT */
  const confirmPayment = async (payment) => {
    try {
      await updateDoc(doc(db, "payments", payment.id), {
        confirmed: true,
        confirmedAt: serverTimestamp()
      });
      await updateDoc(doc(db, "workers", payment.workerId), {
        isPaid: true,
        paidUntil: new Date(Date.now() + 30 * 86400000)
      });
      alert(`Payment confirmed for ${payment.workerName}`);
    } catch (e) {
      console.error("Payment confirm error:", e);
      alert("Failed to confirm payment.");
    }
  };

  const paid = approved.filter((w) => w.isPaid);
  const totalAdRevenue = 800;
  const workerRevenue = paid.length * 49;
  const totalRevenue = workerRevenue + totalAdRevenue;

  return (
    <div>

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
          Admin Dashboard
        </span>
        <button
          onClick={() => signOut(auth)}
          style={{
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            color: "#6b7280",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="num">{approved.length}</div>
          <div className="lbl">Workers</div>
        </div>
        <div className="stat-card">
          <div className="num" style={{ color: "#1D9E75" }}>
            {paid.length}
          </div>
          <div className="lbl">Paid ₹</div>
        </div>
        <div className="stat-card">
          <div className="num" style={{ color: "#f59e0b" }}>
            {pending.length}
          </div>
          <div className="lbl">Pending</div>
        </div>
        <div className="stat-card">
          <div className="num" style={{ color: "#3b82f6" }}>
            {payments.length}
          </div>
          <div className="lbl">Payments</div>
        </div>
      </div>

      {/* PENDING PAYMENTS */}
      {payments.length > 0 && (
        <>
          <p className="section-head">
            Pending Payments ({payments.length})
          </p>
          {payments.map((p) => (
            <div key={p.id} className="payment-card">
              <div className="payment-top">
                <div className="payment-name">{p.workerName}</div>
                <span
                  className="new-badge"
                  style={{ background: "#fef3c7", color: "#92400e" }}
                >
                  ₹{p.amount || 49}
                </span>
              </div>
              <div className="payment-meta">
                {p.upiId ? `UPI: ${p.upiId}` : "UPI Payment"}
                {p.transactionId ? ` · TXN: ${p.transactionId}` : ""}
              </div>
              <div className="payment-actions">
                <button
                  className="btn-confirm"
                  onClick={() => confirmPayment(p)}
                >
                  Confirm ✓
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* PENDING APPROVAL */}
      {pending.length > 0 && (
        <>
          <p className="section-head">
            Pending Approval ({pending.length})
          </p>
          {pending.map((w) => (
            <div key={w.id} className="pending-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16
                }}
              >
                {/* PROFILE PHOTO — clickable to open full size */}
                <div
                  onClick={() => {
                    if (w.image) window.open(w.image, "_blank");
                  }}
                  style={{ cursor: w.image ? "pointer" : "default", flexShrink: 0 }}
                  title={w.image ? "Click to view full photo" : "No photo uploaded"}
                >
                  <img
                    src={
                      w.image ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(w.name || "W") +
                        "&background=ecfdf5&color=0d7a56&size=80"
                    }
                    alt={w.name}
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 20,
                      objectFit: "cover",
                      border: w.image ? "3px solid #6ee7b7" : "3px solid #ecfdf5",
                      background: "#f3f4f6",
                      display: "block"
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pending-top">
                    <div className="pending-name">{w.name}</div>
                    <span className="new-badge">New</span>
                  </div>
                  <div className="pending-meta">
                    {w.skill}
                    {w.area ? ` · ${w.area}` : ""}
                    {w.experience ? ` · ${w.experience}` : ""}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: "#6b7280",
                      fontWeight: 600
                    }}
                  >
                    📞 {w.phone}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: "#6b7280"
                    }}
                  >
                    🕐 {w.availability || "—"}
                  </div>
                </div>
              </div>

              {/* VERIFICATION SECTION */}
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 2
                  }}
                >
                  Verification Details
                </div>

                {/* Phone */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>📞</span>
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>
                    {w.phone || "—"}
                  </span>
                </div>

                {/* Aadhaar Number */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>🆔</span>
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>
                    Aadhaar: {maskAadhaar(w.aadhaar)}
                  </span>
                </div>

                {/* Profile Photo status */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>📷</span>
                  {w.image ? (
                    <button
                      onClick={() => window.open(w.image, "_blank")}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        fontSize: 13,
                        color: "#1D9E75",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      View Profile Photo ↗
                    </button>
                  ) : (
                    <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
                      No photo uploaded
                    </span>
                  )}
                </div>

                {/* Aadhaar Card */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>📄</span>
                  {w.aadhaarImage ? (
                    <button
                      onClick={() => window.open(w.aadhaarImage, "_blank")}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        fontSize: 13,
                        color: "#1D9E75",
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      View Aadhaar Card ↗
                    </button>
                  ) : (
                    <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
                      No Aadhaar card uploaded
                    </span>
                  )}
                </div>
              </div>

              <div className="pending-actions">
                <button
                  className="btn-approve"
                  onClick={() => approveWorker(w)}
                >
                  Approve ✓
                </button>
                <button
                  className="btn-reject"
                  onClick={() => rejectWorker(w.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* APPROVED WORKERS */}
      {approved.length > 0 && (
        <>
          <p className="section-head">Workers & Leads</p>
          {approved.map((w) => {
            const daysLeft = trialDaysLeft(w.approvedAt);
            return (
              <div
                key={w.id}
                className="pending-card"
                style={{ marginBottom: 16 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 16
                  }}
                >
                  <img
                    src={
                      w.image ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(w.name || "W") +
                        "&background=ecfdf5&color=0d7a56&size=80"
                    }
                    alt={w.name}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      objectFit: "cover",
                      border: "3px solid #ecfdf5"
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 6
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 16,
                          color: "#111827"
                        }}
                      >
                        {w.name}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {w.isFeatured && (
                          <span
                            className="new-badge"
                            style={{
                              background: "#fef3c7",
                              color: "#92400e"
                            }}
                          >
                            ⭐ Featured
                          </span>
                        )}
                        {w.isPaid && (
                          <span
                            className="new-badge"
                            style={{
                              background: "#dcfce7",
                              color: "#166534"
                            }}
                          >
                            💰 Paid
                          </span>
                        )}
                        {!w.isPaid && daysLeft > 0 && (
                          <span
                            className="new-badge"
                            style={{
                              background: "#ede9fe",
                              color: "#5b21b6"
                            }}
                          >
                            Trial {daysLeft}d
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="pending-meta"
                      style={{ marginTop: 4 }}
                    >
                      {w.skill}
                      {w.area ? ` · ${w.area}` : ""}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#6b7280"
                      }}
                    >
                      🕐 {w.availability || "—"}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 14,
                        flexWrap: "wrap"
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#6b7280"
                        }}
                      >
                        📞 Leads: {w.leadsTotal || 0}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#6b7280"
                        }}
                      >
                        ⭐ Rating: {w.rating || "—"}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#6b7280"
                        }}
                      >
                        🔨 Jobs: {w.jobCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn-approve"
                    style={{
                      flex: 1,
                      background: w.isFeatured ? "#f59e0b" : "#111827"
                    }}
                    onClick={() => toggleFeatured(w)}
                  >
                    {w.isFeatured ? "✓ Featured" : "Make Featured"}
                  </button>
                  <button
                    className="btn-reject"
                    style={{ flex: 1 }}
                    onClick={() => removeWorker(w.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {approved.length === 0 && pending.length === 0 && (
        <div className="empty-state" style={{ padding: "40px 0" }}>
          No workers yet.
        </div>
      )}
    </div>
  );
}