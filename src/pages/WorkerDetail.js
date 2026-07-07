import React, {
  useEffect,
  useState
} from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

import { db } from "../lib/firebase";

/* Availability color — matches exact RegisterWorker.js AVAILABILITY values */
function getAvailabilityStyle(availability) {
  const normalized = (availability || "").trim().toLowerCase();
  switch (normalized) {
    case "available now":
      return { background: "#dcfce7", color: "#166534" };
    case "mornings only":
      return { background: "#dbeafe", color: "#1d4ed8" };
    case "afternoons only":
      return { background: "#fef3c7", color: "#92400e" };
    case "evenings only":
      return { background: "#ede9fe", color: "#6d28d9" };
    case "weekdays only":
      return { background: "#e0f2fe", color: "#0369a1" };
    case "busy":
      return { background: "#fee2e2", color: "#b91c1c" };
    default:
      return { background: "#f3f4f6", color: "#374151" };
  }
}

export default function WorkerDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitLoading, setSubmitLoading] = useState(false);

  /* WORKER */
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(
      doc(db, "workers", id),
      (snap) => {
        if (snap.exists()) {
          setWorker({ id: snap.id, ...snap.data() });
        }
      }
    );
    return unsub;
  }, [id]);

  /* REVIEWS */
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "reviews"),
      where("workerId", "==", id)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      arr.sort((a, b) => {
        const ta = a.createdAt?.toDate?.() ?? new Date(0);
        const tb = b.createdAt?.toDate?.() ?? new Date(0);
        return tb - ta;
      });
      setReviews(arr);
    });
    return unsub;
  }, [id]);

  /* PROFILE VIEW TRACKING — once per session */
  useEffect(() => {
    if (!id) return;
    const viewedKey = `viewed_${id}`;
    if (sessionStorage.getItem(viewedKey)) return;

    updateDoc(doc(db, "workers", id), {
      profileViews: increment(1)
    })
      .then(() => sessionStorage.setItem(viewedKey, "true"))
      .catch((e) => console.error("View tracking error:", e));
  }, [id]);

  /* SUBMIT REVIEW */
  const submitReview = async () => {
    if (!reviewText.trim()) {
      alert("Please write a review before submitting.");
      return;
    }
    setSubmitLoading(true);
    try {
      await addDoc(collection(db, "reviews"), {
        workerId: id,
        workerName: worker?.name || "",
        rating: reviewRating,
        review: reviewText.trim(),
        createdAt: serverTimestamp()
      });

      const snap = await getDocs(
        query(collection(db, "reviews"), where("workerId", "==", id))
      );
      const allReviews = snap.docs.map((d) => d.data());
      const newAvg =
        allReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) /
        allReviews.length;

      await updateDoc(doc(db, "workers", id), {
        rating: Math.round(newAvg * 10) / 10,
      });

      alert("Review submitted!");
      setReviewOpen(false);
      setReviewText("");
      setReviewRating(5);
    } catch (e) {
      console.error("Review error:", e);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  /* LOADING */
  if (!worker) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
        Loading...
      </div>
    );
  }

  /* STARS HELPER */
  const starsDisplay = (n = 0) => {
    if (!n) return "☆☆☆☆☆";
    const full = Math.floor(n);
    const half = n % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
  };

  const avatarUrl =
    worker.image ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(worker.name || "W") +
      "&background=0d7a56&color=fff&size=200";

  const displayRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) /
            reviews.length) *
            10
        ) / 10
      : worker.rating || null;

  const availabilityStyle = getAvailabilityStyle(worker.availability);

  return (
    <div style={{ paddingBottom: 120 }}>

      {/* HERO */}
      <div
        style={{
          background: "linear-gradient(135deg,#0d7a56,#18c47f)",
          padding: "28px 20px",
          color: "#fff",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          position: "relative"
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            border: "none",
            background: "rgba(255,255,255,.18)",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 12,
            marginBottom: 24,
            cursor: "pointer",
            fontWeight: 700
          }}
        >
          ← Back
        </button>

        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center"
          }}
        >
          <img
            src={avatarUrl}
            alt={worker.name}
            style={{
              width: 90,
              height: 90,
              borderRadius: 24,
              objectFit: "cover",
              border: "3px solid rgba(255,255,255,.3)",
              flexShrink: 0
            }}
          />
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {worker.name}
            </h2>
            <div style={{ opacity: 0.92, marginTop: 4, fontSize: 14 }}>
              {worker.skill}
              {worker.area ? ` • ${worker.area}` : ""}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>{starsDisplay(displayRating)}</span>
              {displayRating !== null ? (
                <span>{displayRating}</span>
              ) : (
                <span style={{ fontSize: 12, opacity: 0.8 }}>No reviews yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: "18px 16px" }}>

        {/* BADGES */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 18
          }}
        >
          {/* Verified badge — always hardcoded green */}
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "8px 14px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 13
            }}
          >
            ✓ Verified Worker
          </div>

          {worker.experience && (
            <div
              style={{
                background: "#fff6d8",
                color: "#b7791f",
                padding: "8px 14px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13
              }}
            >
              {worker.experience}
            </div>
          )}

          {worker.availability && (
            <div
              style={{
                background: availabilityStyle.background,
                color: availabilityStyle.color,
                padding: "8px 14px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13
              }}
            >
              {worker.availability}
            </div>
          )}
        </div>

        {/* ANALYTICS */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 18,
            boxShadow: "0 6px 24px rgba(0,0,0,.06)",
            marginBottom: 18
          }}
        >
          <div
            style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}
          >
            Performance
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12
            }}
          >
            <div className="live-review">
              👀 {worker.profileViews || 0}
              <div
                style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
              >
                Profile Views
              </div>
            </div>
            <div className="live-review">
              📞 {worker.callClicks || 0}
              <div
                style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
              >
                Call Clicks
              </div>
            </div>
            <div className="live-review">
              💬 {worker.whatsappClicks || 0}
              <div
                style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
              >
                WhatsApp Clicks
              </div>
            </div>
            <div className="live-review">
              🔨 {reviews.length}
              <div
                style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
              >
                Jobs Done
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: 18,
            boxShadow: "0 6px 24px rgba(0,0,0,.06)",
            marginBottom: 18
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 800 }}>
              Customer Reviews ({reviews.length})
            </div>
            <button
              onClick={() => setReviewOpen(true)}
              style={{
                border: "none",
                background: "#0f172a",
                color: "#fff",
                borderRadius: 10,
                padding: "7px 12px",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer"
              }}
            >
              ⭐ Review
            </button>
          </div>

          {reviews.length === 0 && (
            <div style={{ color: "#9ca3af", fontSize: 13 }}>
              No reviews yet. Be the first!
            </div>
          )}

          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #f3f4f6"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: "#f59e0b",
                    fontSize: 13
                  }}
                >
                  {"★".repeat(Number(r.rating) || 0)}
                  {"☆".repeat(5 - (Number(r.rating) || 0))}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    fontWeight: 600
                  }}
                >
                  {r.rating}/5
                </span>
              </div>
              <div
                style={{ color: "#4b5563", lineHeight: 1.6, fontSize: 13 }}
              >
                {r.review}
              </div>
              {r.createdAt?.toDate && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: "#9ca3af"
                  }}
                >
                  {r.createdAt.toDate().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STICKY CALL / WHATSAPP */}
      <div
        style={{
          position: "fixed",
          bottom: 18,
          left: 16,
          right: 16,
          display: "flex",
          gap: 12,
          zIndex: 100
        }}
      >
        <button
          onClick={async () => {
            try {
              await updateDoc(doc(db, "workers", worker.id), {
                callClicks: increment(1),
                leadsTotal: increment(1)
              });
            } catch (e) {
              console.error(e);
            }
            window.location.href = `tel:${worker.phone}`;
          }}
          style={{
            flex: 1,
            border: "none",
            background: "#ecfdf5",
            color: "#047857",
            padding: "18px",
            borderRadius: 18,
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          📞 Call
        </button>

        <button
          onClick={async () => {
            try {
              await updateDoc(doc(db, "workers", worker.id), {
                whatsappClicks: increment(1),
                leadsTotal: increment(1)
              });
            } catch (e) {
              console.error(e);
            }
            window.open(`https://wa.me/91${worker.phone}`, "_blank");
          }}
          style={{
            flex: 1,
            border: "none",
            background: "#22c55e",
            color: "#fff",
            padding: "18px",
            borderRadius: 18,
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          💬 WhatsApp
        </button>
      </div>

      {/* REVIEW MODAL */}
      {reviewOpen && (
        <div className="review-overlay">
          <div className="review-modal">
            <h3>Leave a Review for {worker.name}</h3>

            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(Number(e.target.value))}
              style={{ marginBottom: 12 }}
            >
              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
              <option value={3}>⭐⭐⭐ 3 Stars</option>
              <option value={2}>⭐⭐ 2 Stars</option>
              <option value={1}>⭐ 1 Star</option>
            </select>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review..."
              rows={4}
              style={{ marginBottom: 12 }}
            />

            <button
              onClick={submitReview}
              disabled={submitLoading}
              style={{
                width: "100%",
                border: "none",
                background: submitLoading ? "#9ca3af" : "#10b981",
                color: "#fff",
                padding: "13px",
                borderRadius: 12,
                fontWeight: 700,
                cursor: submitLoading ? "not-allowed" : "pointer",
                marginBottom: 8,
                fontSize: 14
              }}
            >
              {submitLoading ? "Submitting..." : "Submit Review"}
            </button>

            <button
              onClick={() => {
                setReviewOpen(false);
                setReviewText("");
                setReviewRating(5);
              }}
              style={{
                width: "100%",
                border: "none",
                background: "#f3f4f6",
                color: "#374151",
                padding: "13px",
                borderRadius: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}