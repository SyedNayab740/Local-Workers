import React, { useState } from "react";

import { db } from "../lib/firebase";

import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

const SKILLS = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "AC Repair",
  "Glass Worker",
  "Aluminium Worker",
  "Bike Mechanic",
  "Welder"
];

const EXPERIENCE = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years"
];

const AVAILABILITY = [
  "Available now",
  "Mornings only",
  "Afternoons only",
  "Evenings only",
  "Weekdays only"
];

export default function RegisterWorker() {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    aadhaar: "",
    skill: "",
    experience: "",
    availability: "",
    area: ""
  });

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [aadhaarImage, setAadhaarImage] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* SUBMIT */
  const submit = async () => {
    const {
      name,
      phone,
      aadhaar,
      skill,
      experience,
      availability,
      area
    } = form;

    if (
      !name ||
      !phone ||
      !aadhaar ||
      !skill ||
      !experience ||
      !availability ||
      !area ||
      !image ||
      !aadhaarImage
    ) {
      alert("Please fill all fields and upload both Profile Photo and Aadhaar Card");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        "Phone number must be 10 digits and start with 6, 7, 8, or 9"
      );
      return;
    }
    if (!/^\d{12}$/.test(aadhaar)) {
      setError(
        "Aadhaar number must contain exactly 12 digits"
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      /* CLOUDINARY — PROFILE PHOTO */
      const profileData = new FormData();
      profileData.append("file", image);
      profileData.append("upload_preset", "localwala");

      const profileRes = await fetch(
        "https://api.cloudinary.com/v1_1/dvfajanfh/image/upload",
        { method: "POST", body: profileData }
      );

      if (!profileRes.ok) {
        throw new Error("Profile photo upload failed");
      }

      const uploadedProfile = await profileRes.json();
      const imageUrl = uploadedProfile.secure_url;

      /* CLOUDINARY — AADHAAR CARD */
      const aadhaarData = new FormData();
      aadhaarData.append("file", aadhaarImage);
      aadhaarData.append("upload_preset", "localwala");

      const aadhaarRes = await fetch(
        "https://api.cloudinary.com/v1_1/dvfajanfh/image/upload",
        { method: "POST", body: aadhaarData }
      );

      if (!aadhaarRes.ok) {
        throw new Error("Aadhaar card upload failed");
      }

      const uploadedAadhaar = await aadhaarRes.json();
      const aadhaarImageUrl = uploadedAadhaar.secure_url;

      /* SAVE TO FIRESTORE */
      await addDoc(collection(db, "workers"), {
        name: name
          .trim()
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" "),

        phone: phone.replace(/\D/g, "").trim(),
        aadhaar: aadhaar.trim(),

        image: imageUrl,
        aadhaarImage: aadhaarImageUrl,

        skill,
        experience,
        availability,

        area:
          area.trim().charAt(0).toUpperCase() +
          area.trim().slice(1).toLowerCase(),

        status: "pending",
        isPaid: false,
        isFeatured: false,
        leadsToday: 0,
        leadsTotal: 0,
        callClicks: 0,
        whatsappClicks: 0,
        profileViews: 0,
        approvedAt: null,
        createdAt: serverTimestamp(),

        rating: 0,
        jobCount: 0
      });

      setDone(true);
      setForm({
        name: "",
        phone: "",
        aadhaar: "",
        skill: "",
        experience: "",
        availability: "",
        area: ""
      });
      setImage(null);
      setAadhaarImage(null);

    } catch (e) {
      console.error("Registration error:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* SUCCESS */
  if (done)
    return (
      <div className="content">
        <div className="success-box">
          <div
            className="success-icon"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "42px",
              fontWeight: "bold"
            }}
          >
            ✓
          </div>
          <h3>Registration Submitted ✅</h3>
          <p>
            Admin will review your profile within 24 hours.
            <br />
            <span style={{ color: "#bcc3cc", fontSize: 12 }}>
              మీ ప్రొఫైల్ 24 గంటల్లో పరిశీలించబడుతుంది
            </span>
          </p>
        </div>
      </div>
    );

  /* PAGE */
  return (
    <div className="content">

      {/* PROMO */}
      <div className="promo-strip">
        <div
          className="promo-ic"
          style={{ fontSize: 22 }}
        >
          🤝
        </div>
        <div>
          <h3>మీ ప్రాంతంలోనే ఎక్కువ మంది కస్టమర్లను పొందండి</h3>
          <p>
             Admin verifies every profile before
            listing.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="err-msg">
          <i className="ti ti-alert-circle" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* PROFILE PHOTO */}
      <div className="form-card photo-upload-section">
        <div className="form-card-title">
          <i className="ti ti-camera" aria-hidden="true" />
          Profile photo
        </div>

        <div className="photo-upload-row">
          <div className="profile-preview">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="profile-img"
              />
            ) : (
              <div className="profile-placeholder">
                <i className="ti ti-user" />
              </div>
            )}
          </div>

          <label className="upload-btn">
            <i className="ti ti-upload" />
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  alert("Image must be under 5MB");
                  return;
                }
                setImage(file);
              }}
              hidden
            />
          </label>
        </div>
      </div>

      {/* AADHAAR CARD UPLOAD */}
      <div className="form-card photo-upload-section">
        <div className="form-card-title">
          <i className="ti ti-id" aria-hidden="true" />
          Aadhaar Card
        </div>

        <div className="photo-upload-row">
          <div className="profile-preview">
            {aadhaarImage ? (
              <img
                src={URL.createObjectURL(aadhaarImage)}
                alt="aadhaar preview"
                className="profile-img"
              />
            ) : (
              <div className="profile-placeholder">
                <i className="ti ti-id" />
              </div>
            )}
          </div>

          <label className="upload-btn">
            <i className="ti ti-upload" />
            Upload Aadhaar
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  alert("Image must be under 5MB");
                  return;
                }
                setAadhaarImage(file);
              }}
              hidden
            />
          </label>
        </div>
      </div>

      {/* PERSONAL DETAILS */}
      <div className="form-card">
        <div className="form-card-title">
          <i className="ti ti-user" aria-hidden="true" />
          Personal details
        </div>

        <div className="fg">
          <label>Full name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        <div className="fg">
          <label>Phone number</label>
          <input
            type="tel"
            placeholder="9XXXXXXXXX"
            maxLength={10}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <div className="fg">
          <label>Aadhaar Number</label>
          <input
            type="text"
            placeholder="123456789012"
            maxLength={12}
            value={form.aadhaar}
            onChange={(e) =>
              set("aadhaar", e.target.value.replace(/\D/g, ""))
            }
          />
        </div>

        <div className="fg-2">
          <div className="fg">
            <label>Adress</label>
            <input
              type="text"
              placeholder="Your area"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
            />
          </div>

          <div className="fg">
            <label>Skill</label>
            <select
              value={form.skill}
              onChange={(e) => set("skill", e.target.value)}
            >
              <option value="">Select</option>
              {SKILLS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* WORK DETAILS */}
      <div className="form-card">
        <div className="form-card-title">
          <i className="ti ti-briefcase" aria-hidden="true" />
          Work details
        </div>

        <div className="fg-2">
          <div className="fg">
            <label>Experience</label>
            <select
              value={form.experience}
              onChange={(e) => set("experience", e.target.value)}
            >
              <option value="">Select</option>
              {EXPERIENCE.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="fg">
            <label>Availability</label>
            <select
              value={form.availability}
              onChange={(e) => set("availability", e.target.value)}
            >
              <option value="">Select</option>
              {AVAILABILITY.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SUBMIT */}
      <button
        className="submit-btn"
        onClick={submit}
        disabled={loading}
      >
        {loading
          ? "Submitting..."
          : "Register Free · ఫ్రీగా నమోదు చేయండి"}
      </button>

      <p className="submit-note">
        Admin will review your profile within 24 hours ·
        మీ ప్రొఫైల్ 24 గంటల్లో పరిశీలించబడుతుంది
      </p>
    </div>
  );
}