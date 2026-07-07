import React, {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

import { db } from "../lib/firebase";

const SERVICES = [

  {
    name: "Electrician",
    emoji: "🔌"
  },

  {
    name: "Plumber",
    emoji: "🚰"
  },

  {
    name: "Carpenter",
    emoji: "🪚"
  },

  {
    name: "Painter",
    emoji: "🎨"
  },

  {
    name: "AC Repair",
    emoji: "❄️"
  },

  {
    name: "Bike Mechanic",
    emoji: "🏍️"
  },

  {
    name: "Welder",
    emoji: "🔥"
  },

  {
    name: "Glass Worker",
    emoji: "🪟"
  }

];

export default function Services() {

  const navigate =
    useNavigate();

  const [workers, setWorkers] =
    useState([]);

  /* REALTIME WORKERS */

  useEffect(() => {

    const q = query(

      collection(
        db,
        "workers"
      ),

      where(
        "status",
        "==",
        "approved"
      )

    );

    const unsub =
      onSnapshot(

        q,

        (snapshot) => {

          const arr =
            snapshot.docs.map(
              (doc) => ({
                id:
                  doc.id,
                ...doc.data()
              })
            );

          setWorkers(arr);

        }

      );

    return unsub;

  }, []);

  /* COUNT */

  const getCount =
    (serviceName) => {

      return workers.filter(
        (w) =>
          w.skill ===
          serviceName
      ).length;

    };

  return (

    <div
      style={{
        padding: 16,
        paddingBottom: 120
      }}
    >

  {/* HERO */}

<div
  style={{
    background:
      "linear-gradient(135deg,#0d7a56,#18c47f)",
    borderRadius: 22,
    padding: "18px 20px",
    color: "#fff",
    marginBottom: 18,
    boxShadow:
      "0 10px 24px rgba(16,185,129,.15)"
  }}
>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14
    }}
  >

    <div
      style={{
        fontSize: 36
      }}
    >
      🛠️
    </div>

    <div>

      <h2
        style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 800,
          lineHeight: 1.1
        }}
      >
      
      </h2>

      <div
        style={{
          marginTop: 4,
          fontSize: 14,
          opacity: 0.95
        }}
      >
        మీ ఇంటి పనుల కోసం నమ్మకమైన వర్కర్స్.. ఇప్పుడు మరింత సులభంగా!
      </div>

    </div>

  </div>

</div>

      {/* GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: 16
        }}
      >

        {SERVICES.map(
          (s, i) => (

            <div
              key={i}
              onClick={() =>
                navigate(
                  `/?category=${encodeURIComponent(s.name)}`
                )
              }
              style={{
                background:
                  "#fff",
                borderRadius:
                  24,
                padding: 20,
                cursor:
                  "pointer",
                boxShadow:
                  "0 10px 30px rgba(15,23,42,.06)",
                transition:
                  ".2s"
              }}
            >

              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius:
                    20,
                  background:
                    "linear-gradient(135deg,#e7fff2,#d9fff1)",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize: 30,
                  marginBottom:
                    16
                }}
              >

                {s.emoji}

              </div>

              <div
                style={{
                  fontWeight:
                    800,
                  fontSize: 17,
                  color:
                    "#111827"
                }}
              >

                {s.name}

              </div>

              <div
                style={{
                  marginTop: 6,
                  color:
                    "#6b7280",
                  fontSize: 14
                }}
              >

                {
                  getCount(
                    s.name
                  )
                }
                {" "}
                workers near you

              </div>

            </div>

          )
        )}

      </div>

    </div>

  );

}