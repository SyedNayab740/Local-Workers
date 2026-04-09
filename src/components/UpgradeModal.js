import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// ✏️ REPLACE with your actual UPI ID
const YOUR_UPI_ID = "yourname@upi";
const YOUR_NAME = "Your Name";
const AMOUNT = 49;

export default function UpgradeModal({ onClose, workerPhone, workerName }) {
  const [step, setStep] = useState(1); // 1 = info, 2 = pay instructions, 3 = confirm
  const [utr, setUtr] = useState("");
  const [phone, setPhone] = useState(workerPhone || "");
  const [name, setName] = useState(workerName || "");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submitPayment = async () => {
    if (!phone || phone.length < 10) { setError("Enter your phone number"); return; }
    if (!name) { setError("Enter your name"); return; }
    setError("");
    try {
      await addDoc(collection(db, "payments"), {
        workerName: name,
        workerPhone: phone,
        utrNumber: utr,
        amount: AMOUNT,
        confirmed: false,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e) {
      setError("Failed to submit. Try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">

        {!submitted ? (
          <>
            {step === 1 && (
              <>
                <h3>Upgrade to Paid Listing</h3>
                <p>Appear at the top. Get more customers every month.</p>
                <div className="feat-item">✅ Top position in all searches</div>
                <div className="feat-item">✅ Phone &amp; WhatsApp shown directly</div>
                <div className="feat-item">✅ "Paid Member" badge builds trust</div>
                <div className="feat-item">✅ Unlimited customer leads per month</div>
                <div className="price-display">₹49 <small>/ month</small></div>
                <button className="pay-btn" onClick={() => setStep(2)}>Pay Now via UPI</button>
                <button className="cancel-btn" onClick={onClose}>Maybe later</button>
              </>
            )}

            {step === 2 && (
              <>
                <h3>Pay ₹49 via UPI</h3>
                <div className="upi-box">
                  <h4>Payment instructions:</h4>
                  <div className="upi-step">1. Open PhonePe, GPay, or any UPI app</div>
                  <div className="upi-step">2. Send ₹49 to this UPI ID:</div>
                  <div className="upi-id">{YOUR_UPI_ID}</div>
                  <div className="upi-step">3. Note the UTR / transaction number</div>
                  <div className="upi-step">4. Come back here and enter it below</div>
                </div>

                {error && <div className="error-msg">{error}</div>}

                {!workerName && (
                  <div className="form-group">
                    <label>Your name</label>
                    <input placeholder="Name as on app" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                )}
                {!workerPhone && (
                  <div className="form-group">
                    <label>Your phone number</label>
                    <input type="tel" placeholder="Registered phone number" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                )}
                <div className="form-group">
                  <label>UTR / Transaction number <em>Optional but faster</em></label>
                  <input placeholder="12-digit UTR number" value={utr} onChange={e => setUtr(e.target.value)} />
                </div>

                <button className="pay-btn" onClick={submitPayment}>I have paid — confirm now</button>
                <button className="cancel-btn" onClick={() => setStep(1)}>Back</button>
              </>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
            <h3 style={{ marginBottom: 8 }}>Payment submitted!</h3>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
              Admin will verify your payment and activate your paid listing within a few hours.<br /><br />
              You'll appear at the top once confirmed.
            </p>
            <button className="pay-btn" style={{ marginTop: 16 }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
