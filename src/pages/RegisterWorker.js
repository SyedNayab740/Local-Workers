import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const SKILLS = ["Plumber", "Electrician", "Mechanic", "Carpenter", "Painter", "AC Repair", "Welder"];
const EXPERIENCE = ["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"];
const AVAILABILITY = ["Available now", "Mornings only", "Afternoons only", "Evenings only", "Weekdays only"];

export default function RegisterWorker() {
  const [form, setForm] = useState({
    name: "", phone: "", skill: "", experience: "", availability: "", area: ""
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    const { name, phone, skill, experience, availability, area } = form;
    if (!name || !phone || !skill || !experience || !availability || !area) {
      setError("Please fill all fields / అన్ని వివరాలు నింపండి");
      return;
    }
    if (phone.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await addDoc(collection(db, "workers"), {
        name: name.trim(),
        phone: phone.trim(),
        skill,
        experience,
        availability,
        area: area.trim(),
        status: "pending",    // admin must approve
        isPaid: false,
        leadsToday: 0,
        leadsTotal: 0,
        approvedAt: null,
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="success-box">
        <div className="icon">✅</div>
        <h3>Registration sent! / నమోదు పంపబడింది!</h3>
        <p>
          Admin will approve your profile within 24 hours.<br />
          Your 7-day free trial starts after approval.<br /><br />
          మీ ప్రొఫైల్ 24 గంటల్లో అనుమతించబడుతుంది.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="reg-intro">
        Register free. Admin verifies you first. After approval, your 7-day free trial starts automatically.<br />
        Upgrade to ₹49/month to stay at the top and get more customers.
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="form-group">
        <label>Full name / పూర్తి పేరు</label>
        <input placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} />
      </div>

      <div className="form-group">
        <label>Phone number / ఫోన్ నంబర్ <em>Customers will call this</em></label>
        <input type="tel" placeholder="9XXXXXXXXX" maxLength={10} value={form.phone} onChange={e => set("phone", e.target.value)} />
      </div>

      <div className="form-group">
        <label>Skill / నైపుణ్యం</label>
        <select value={form.skill} onChange={e => set("skill", e.target.value)}>
          <option value="">Select your skill / ఎంచుకోండి</option>
          {SKILLS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Experience / అనుభవం</label>
        <select value={form.experience} onChange={e => set("experience", e.target.value)}>
          <option value="">Select years of experience</option>
          {EXPERIENCE.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Availability / అందుబాటు</label>
        <select value={form.availability} onChange={e => set("availability", e.target.value)}>
          <option value="">Select availability</option>
          {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Area / ప్రాంతం</label>
        <input placeholder="Your colony or area name" value={form.area} onChange={e => set("area", e.target.value)} />
      </div>

      <button className="submit-btn" onClick={submit} disabled={loading}>
        {loading ? "Submitting..." : "Register as Worker (Free) / ఉచితంగా నమోదు చేయండి"}
      </button>

      <p className="form-note">
        ✅ 7-day free trial after approval<br />
        ⏰ Admin reviews within 24 hours<br />
        💰 ₹49/month to appear at the top
      </p>
    </div>
  );
}
