import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, doc, updateDoc, increment
} from "firebase/firestore";

const SKILLS = ["All", "Plumber", "Electrician", "Mechanic", "Carpenter", "Painter", "AC Repair", "Welder"];

// Sample sponsored ads — replace with real data from Firestore or hardcode your local advertisers
const ADS = [
  {
    id: 1,
    logo: "🔩",
    name: "Ravi Hardware Store",
    sub: "Pipes, wires, tools • Home delivery available",
    phone: "9800000001",
    position: "top",
  },
  {
    id: 2,
    logo: "⚙️",
    name: "Kumar Auto Parts",
    sub: "All vehicle spare parts • Bus Stand, Nandyal",
    phone: "9800000002",
    position: "mid",
  },
];

function trialDaysLeft(approvedAt) {
  if (!approvedAt) return 0;
  const approved = approvedAt.toDate ? approvedAt.toDate() : new Date(approvedAt);
  const diff = 7 - Math.floor((Date.now() - approved.getTime()) / 86400000);
  return Math.max(0, diff);
}

function getInitials(name) {
  return name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
}

const AV_COLORS = ["av-green", "av-blue", "av-amber", "av-purple"];
function avatarColor(name) {
  const code = (name || "").charCodeAt(0) % 4;
  return AV_COLORS[code];
}

export default function FindWorkers({ onUpgrade }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("All");

  useEffect(() => {
    const q = query(
      collection(db, "workers"),
      where("status", "==", "approved"),
      orderBy("isPaid", "desc"),
      orderBy("approvedAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setWorkers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const trackLead = async (workerId, type) => {
    try {
      await updateDoc(doc(db, "workers", workerId), {
        leadsToday: increment(1),
        leadsTotal: increment(1),
      });
    } catch (e) {}
  };

  const filtered = workers.filter(w => {
    const matchSkill = skillFilter === "All" || w.skill === skillFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || w.name?.toLowerCase().includes(q) || w.skill?.toLowerCase().includes(q) || w.area?.toLowerCase().includes(q);
    return matchSkill && matchSearch;
  });

  // Separate paid vs trial/expired for display order
  const paid = filtered.filter(w => w.isPaid);
  const trial = filtered.filter(w => !w.isPaid && trialDaysLeft(w.approvedAt) > 0);
  const expired = filtered.filter(w => !w.isPaid && trialDaysLeft(w.approvedAt) === 0);
  const ordered = [...paid, ...trial, ...expired];

  const topAd = ADS.find(a => a.position === "top");
  const midAd = ADS.find(a => a.position === "mid");

  return (
    <div>
      {topAd && (
        <div className="sponsored">
          <div className="sp-logo">{topAd.logo}</div>
          <div className="sp-info">
            <div className="sp-title">{topAd.name}</div>
            <div className="sp-sub">{topAd.sub}</div>
            <span className="sp-tag">Sponsored</span>
          </div>
          <a href={`tel:${topAd.phone}`}>
            <button className="sp-btn">Call Now</button>
          </a>
        </div>
      )}

      <div className="trust-bar">
        <span className="icon">✅</span>
        <div>
          <strong>Verified local workers • Safe &amp; trusted</strong>
          <small>All workers checked by admin before listing</small>
        </div>
      </div>

      <input
        className="search-input"
        placeholder="Search plumber, electrician... / వెతకండి"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="chips">
        {SKILLS.map(s => (
          <div
            key={s}
            className={`chip ${skillFilter === s ? "active" : ""}`}
            onClick={() => setSkillFilter(s)}
          >{s}</div>
        ))}
      </div>

      <p className="result-label">{ordered.length} workers found nearby · {ordered.length} మంది కనుగొనబడ్డారు</p>

      {loading && <div className="loading">Loading workers...</div>}

      {!loading && ordered.length === 0 && (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <p>No workers found. Try a different search.</p>
        </div>
      )}

      {!loading && ordered.map((w, i) => {
        const days = trialDaysLeft(w.approvedAt);
        const isExpired = !w.isPaid && days === 0;
        const isTrial = !w.isPaid && days > 0;

        // Insert mid-ad after 2nd paid worker
        const showMidAd = midAd && i === 1 && paid.length >= 2;

        return (
          <React.Fragment key={w.id}>
            {showMidAd && (
              <div className="mid-sponsored">
                <div className="sp-logo" style={{ width: 36, height: 36, fontSize: 16 }}>{midAd.logo}</div>
                <div className="sp-info">
                  <div className="sp-title">{midAd.name}</div>
                  <div className="sp-sub">{midAd.sub}</div>
                  <span className="sp-tag">Sponsored</span>
                </div>
                <a href={`tel:${midAd.phone}`}>
                  <button className="sp-btn" style={{ fontSize: 11 }}>Call</button>
                </a>
              </div>
            )}

            <div className={`wcard ${w.isPaid ? "paid" : ""} ${isExpired ? "dim" : ""}`}>
              {w.isPaid && <div className="paid-pill">⭐ Paid Member · Top listing</div>}

              <div className="wtop">
                <div className={`avatar ${avatarColor(w.name)}`}>{getInitials(w.name)}</div>
                <div style={{ flex: 1 }}>
                  <div className="wname">{w.name}</div>
                  <div className="wsub">{w.skill} · {w.area}</div>
                  <div className="badges">
                    <span className="badge badge-v">✓ Verified</span>
                    {w.experience && <span className="badge badge-exp">{w.experience}</span>}
                    {w.availability && <span className="badge badge-avail">{w.availability}</span>}
                    {isTrial && <span className="badge badge-trial">Trial: {days}d left</span>}
                    {isExpired && <span className="badge badge-ended">Trial ended</span>}
                  </div>
                  {w.leadsToday > 0
                    ? <div className="leads-today">📞 {w.leadsToday} lead{w.leadsToday > 1 ? "s" : ""} today</div>
                    : <div className="leads-zero">📞 0 leads today</div>
                  }
                </div>
              </div>

              <div className="btns">
                <a href={`tel:${w.phone}`} style={{ flex: 1, textDecoration: "none" }}
                  onClick={() => trackLead(w.id, "call")}>
                  <button className="btn-call" style={{ width: "100%" }}>📞 Call</button>
                </a>
                <a href={`https://wa.me/91${w.phone}?text=Hi, I found you on Local Workers app. I need ${w.skill} service.`}
                  target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none" }}
                  onClick={() => trackLead(w.id, "whatsapp")}>
                  <button className="btn-wa" style={{ width: "100%" }}>💬 WhatsApp</button>
                </a>
              </div>

              {isTrial && (
                <div className="urgency">
                  <span>⏰ Only {days} day{days > 1 ? "s" : ""} left — upgrade to keep getting customers</span>
                  <button onClick={onUpgrade}>₹49/mo</button>
                </div>
              )}
              {isExpired && (
                <div className="urgency">
                  <span>⏰ Trial ended — customers can't see you properly. Upgrade now</span>
                  <button onClick={onUpgrade}>₹49/mo</button>
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
