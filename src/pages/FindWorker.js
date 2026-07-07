import React, {
  useState,
  useMemo,
  useEffect
} from "react";

import {
  useLocation
} from "react-router-dom";

import { db } from "../lib/firebase";

import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  increment,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

const TOP_CATEGORIES = [
  "All",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter"
];

const MORE_CATEGORIES = [
  "AC Repair",
  "Welder",
  "Glass Worker",
  "Bike Mechanic"
];

/* Helper: average rating from reviews array */
function avgRating(reviews) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/* Availability color — matches exact RegisterWorker.js AVAILABILITY values */
function getAvailabilityStyle(availability) {
  const normalized = (availability || "").trim().toLowerCase();
  switch (normalized) {
    case "available now":
      return { background: "#dcfce7", color: "#166534", dot: "🟢" };
    case "mornings only":
      return { background: "#dbeafe", color: "#1d4ed8", dot: "🔵" };
    case "afternoons only":
      return { background: "#fef3c7", color: "#92400e", dot: "🟡" };
    case "evenings only":
      return { background: "#ede9fe", color: "#6d28d9", dot: "🟣" };
    case "weekdays only":
      return { background: "#e0f2fe", color: "#0369a1", dot: "🔵" };
    case "busy":
      return { background: "#fee2e2", color: "#b91c1c", dot: "🔴" };
    default:
      return { background: "#f3f4f6", color: "#374151", dot: "⚪" };
  }
}

export default function FindWorker() {

  const location = useLocation();

  const [cat, setCat] = useState("All");
  const [area, setArea] = useState("Nandyal");
  const [workers, setWorkers] = useState([]);
  const [reviewsMap, setReviewsMap] = useState({});
  const [search, setSearch] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitLoading, setSubmitLoading] = useState(false);

  /* URL FILTER */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    if (category) {
      setCat(category);
    }
  }, [location.search]);

  /* WORKERS — real-time */
  useEffect(() => {
    const q = query(
      collection(db, "workers"),
      where("status", "==", "approved")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workersData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      const sortedWorkers = workersData.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.leadsTotal || 0) - (a.leadsTotal || 0);
      });

      setWorkers(sortedWorkers);
    });

    return () => unsubscribe();
  }, []);

  /* REVIEWS — real-time, build a map keyed by workerId */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "reviews"),
      (snapshot) => {
        const map = {};
        snapshot.docs.forEach((d) => {
          const data = d.data();
          const wid = data.workerId;
          if (!wid) return;
          if (!map[wid]) map[wid] = [];
          map[wid].push({ id: d.id, ...data });
        });
        setReviewsMap(map);
      }
    );
    return () => unsubscribe();
  }, []);

  /* FILTER */
  const filtered = useMemo(() => {
    return workers.filter((w) => {
      const matchCat =
        cat === "All" ? true : w.skill === cat;

      const matchArea =
        area === "All"
          ? true
          : (w.area || "")
              .toLowerCase()
              .includes(area.toLowerCase());

      const q = search.trim().toLowerCase();
      const matchQ =
        !q ||
        (w.name || "").toLowerCase().includes(q) ||
        (w.skill || "").toLowerCase().includes(q) ||
        (w.area || "").toLowerCase().includes(q);

      return matchCat && matchArea && matchQ;
    });
  }, [workers, search, cat, area]);

  /* FEATURED */
  const featuredWorkers = useMemo(() => {
    return filtered.filter((w) => w.isFeatured);
  }, [filtered]);

  function getDisplayRating(w) {
    const reviews = reviewsMap[w.id];
    if (reviews && reviews.length > 0) {
      return avgRating(reviews);
    }
    if (w.rating && w.rating !== 4.8) return w.rating;
    if (reviews && reviews.length === 0) return null;
    return w.rating || null;
  }

  function getDisplayJobCount(w) {
    const reviews = reviewsMap[w.id];
    if (reviews !== undefined) {
      return reviews.length;
    }
    return 0;
  }

  function getDisplayAvailability(w) {
    return w.availability || "Available now";
  }

  /* REVIEW SUBMIT */
  const submitReview = async () => {
    if (!selectedWorker) return;
    if (!reviewText.trim()) {
      alert("Please write a review before submitting.");
      return;
    }

    setSubmitLoading(true);
    try {
      await addDoc(collection(db, "reviews"), {
        workerId: selectedWorker.id,
        workerName: selectedWorker.name,
        rating: reviewRating,
        review: reviewText.trim(),
        createdAt: serverTimestamp()
      });

      const reviewsSnap = await getDocs(
        query(
          collection(db, "reviews"),
          where("workerId", "==", selectedWorker.id)
        )
      );
      const allReviews = reviewsSnap.docs.map((d) => d.data());
      const newAvg =
        allReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) /
        allReviews.length;

      await updateDoc(doc(db, "workers", selectedWorker.id), {
        rating: Math.round(newAvg * 10) / 10,
        jobCount: allReviews.length
      });

      alert("Review submitted successfully!");
      setReviewOpen(false);
      setReviewText("");
      setReviewRating(5);
    } catch (e) {
      console.error("Review submit error:", e);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="content find-worker-root">

      {/* ── FIXED HEADER SECTION ── */}
      <div className="find-fixed-header">

        <div className="search-fixed">

          {/* SEARCH */}
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder="Search plumber, electrician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* TOP CATEGORIES */}
          <div className="chips">
            {TOP_CATEGORIES.map((c) => (
              <button
                key={c}
                className={`chip ${cat === c ? "active" : ""}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* MORE CATEGORIES */}
          <div className="chips-more chips">
            {MORE_CATEGORIES.map((c) => (
              <button
                key={c}
                className={`chip chip-small ${cat === c ? "active" : ""}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* LOCATION */}
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#9ca3af"
                    }}
                  >
                    CURRENT LOCATION
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#111827"
                    }}
                  >
                    📍 {area}
                  </div>
                </div>
              </div>

              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                style={{
                  border: "2px solid #047857",
                  background: "#fff",
                  padding: "8px 12px",
borderRadius: 14,
fontWeight: 700,
fontSize: 13,
minWidth: 90,
width: "auto"
                }}
              >
                <option value="All">All</option>
                <option value="Nandyal">Nandyal</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* ── SCROLLABLE BODY SECTION ── */}
      <div className="find-scroll-body">

        {/* FEATURED */}
        {featuredWorkers.length > 0 && (
          <div style={{ marginTop: 14, marginBottom: 14 }}>
            <div className="sec-label" style={{ color: "#f59e0b" }}>
              ⭐ FEATURED WORKERS
            </div>
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                gap: 8,
                paddingBottom: 4
              }}
            >
              {featuredWorkers.map((w) => {
                const dispRating = getDisplayRating(w);
                return (
                  <div
                    key={w.id}
                    style={{
                      minWidth: 185,
                      maxWidth: 185,
                      background: "#fffdf7",
                      border: "1px solid #fde68a",
                      borderRadius: 18,
                      padding: 8,
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}
                    >
                      <img
                        src={w.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(w.name || "W") + "&background=ecfdf5&color=0d7a56&size=80"}
                        alt={w.name}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          objectFit: "cover",
                          flexShrink: 0
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {w.name}
                        </div>
                        <div
                          style={{
                            marginTop: 2,
                            color: "#6b7280",
                            fontWeight: 600,
                            fontSize: 12
                          }}
                        >
                          {w.skill}
                        </div>
                        {dispRating !== null && (
                          <div
                            style={{
                              marginTop: 2,
                              fontSize: 11,
                              color: "#92400e",
                              fontWeight: 700
                            }}
                          >
                            ⭐ {dispRating}
                          </div>
                        )}
                        <div
                          style={{
                            marginTop: 4,
                            background: "#fef3c7",
                            color: "#92400e",
                            padding: "3px 8px",
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 700,
                            display: "inline-block"
                          }}
                        >
                          ⭐ Featured
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION HEADING */}
        <div className="sec-label">
          TRUSTED WORKERS IN {area.toUpperCase()}
          {" · "}
          {filtered.length} AVAILABLE
        </div>

        {/* WORKER CARDS */}
        <div
          className="workers-scroll"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingBottom: 120
          }}
        >
          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#9ca3af",
                fontSize: 14
              }}
            >
              Opening soon in your area!
            </div>
          )}

          {filtered.map((w, i) => {
            const dispRating = getDisplayRating(w);
            const dispJobCount = getDisplayJobCount(w);
            const dispAvailability = getDisplayAvailability(w);
            const availStyle = getAvailabilityStyle(dispAvailability);

            return (
              <div
                className="wcard"
                key={w.id || i}
                style={{ padding: 12, borderRadius: 20 }}
              >
                {/* TOP ROW */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flex: 1,
                      minWidth: 0
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
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        objectFit: "cover",
                        flexShrink: 0
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* NAME + VERIFIED */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexWrap: "wrap"
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 15,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "160px"
                          }}
                        >
                          {w.name}
                        </div>
                        <div
                          style={{
                            background: "#dbeafe",
                            color: "#2563eb",
                            padding: "3px 7px",
                            borderRadius: 8,
                            fontSize: 10,
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                        >
                          Verified
                        </div>
                      </div>

                      {/* SKILL + AREA */}
                      <div
                        style={{
                          marginTop: 3,
                          color: "#6b7280",
                          fontWeight: 600,
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {w.skill}
                        {w.area ? ` • ${w.area}` : ""}
                      </div>

                      {/* RATING + JOBS */}
                      <div
                        style={{
                          marginTop: 4,
                          color: "#374151",
                          fontWeight: 700,
                          fontSize: 13
                        }}
                      >
                        {dispRating !== null ? (
                          <>⭐ {dispRating} · </>
                        ) : (
                          <>⭐ New · </>
                        )}
                        {dispJobCount} job{dispJobCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>

                  {/* REVIEW BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorker(w);
                      setReviewOpen(true);
                    }}
                    style={{
                      border: "none",
                      background: "#0f172a",
                      color: "#fff",
                      borderRadius: 12,
                      padding: "8px 10px",
                      fontWeight: 700,
                      fontSize: 11,
                      cursor: "pointer",
                      flexShrink: 0,
                      whiteSpace: "nowrap"
                    }}
                  >
                    ⭐ Review
                  </button>
                </div>

                {/* TAGS */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 10,
                    flexWrap: "wrap"
                  }}
                >
                  {w.experience && (
                    <div
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        padding: "5px 9px",
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: 11
                      }}
                    >
                      {w.experience}
                    </div>
                  )}
                  <div
                    style={{
                      background: availStyle.background,
                      color: availStyle.color,
                      padding: "5px 9px",
                      borderRadius: 999,
                      fontWeight: 700,
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    {availStyle.dot} {dispAvailability}
                  </div>
                </div>

                {/* CALL + WHATSAPP */}
                <div
                  style={{
                    display: "flex",
                    marginTop: 12,
                    overflow: "hidden",
                    borderRadius: 14
                  }}
                >
                  <button
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, "workers", w.id), {
                          callClicks: increment(1),
                          leadsTotal: increment(1)
                        });
                      } catch (e) {
                        console.error(e);
                      }
                      window.open(`tel:${w.phone}`);
                    }}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "#f0fdf4",
                      padding: 11,
                      fontWeight: 700,
                      color: "#047857",
                      cursor: "pointer"
                    }}
                  >
                    Call
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, "workers", w.id), {
                          whatsappClicks: increment(1),
                          leadsTotal: increment(1)
                        });
                      } catch (e) {
                        console.error(e);
                      }
                      window.open(
                        `https://wa.me/91${w.phone}`,
                        "_blank"
                      );
                    }}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "linear-gradient(135deg,#22c55e,#16a34a)",
                      color: "#fff",
                      padding: 11,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* REVIEW MODAL */}
      {reviewOpen && (
        <div className="review-overlay">
          <div className="review-modal">
            <h3>
              Leave a Review
              {selectedWorker ? ` for ${selectedWorker.name}` : ""}
            </h3>

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