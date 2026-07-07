import SplashScreen from "./components/Splashscreen";
import React, {
  useState,
  useEffect
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  auth
} from "./lib/firebase";

import AppShell from "./components/AppShell";

import FindWorker from "./pages/FindWorker";

import Services from "./pages/Services";

import RegisterWorker from "./pages/RegisterWorker";

import AdminLogin from "./pages/AdminLogin";

import AdminPanel from "./pages/AdminPanel";

export default function App() {

  return (

    <BrowserRouter>

      <MainApp />

    </BrowserRouter>

  );

}

function MainApp() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [tab, setTab] =
    useState("find");

  const [admin, setAdmin] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);
    const [showSplash, setShowSplash] = useState(true);

  /* TAB SYNC */

  useEffect(() => {

    if (
      location.pathname === "/"
    ) {

      setTab("find");

    }

    else if (
      location.pathname === "/services"
    ) {

      setTab("services");

    }

    else if (
      location.pathname === "/register"
    ) {

      setTab("register");

    }

    else if (
      location.pathname === "/admin"
    ) {

      setTab("admin");

    }

  }, [location.pathname]);

  /* AUTH */

  useEffect(() => {

    const unsub =
      onAuthStateChanged(

        auth,

        (user) => {

          setAdmin(user);

          setAuthLoading(false);

        }

      );

    return unsub;

  }, []);

  /* LOADING */

if (authLoading) {
return (
<div
style={{
display: "flex",
alignItems: "center",
justifyContent: "center",
height: "100vh",
background: "#f2f3f7"
}}
>
Loading... </div>
);
}

if (showSplash) {
return (
<SplashScreen
onComplete={() => setShowSplash(false)}
/>
);
}


  /* NAVIGATION */

  const handleTabChange =
    (newTab) => {

      setTab(newTab);

      if (newTab === "find") {

        navigate("/");

      }

      else {

        navigate(`/${newTab}`);

      }

    };

  /* APP */

  return (

    <AppShell
      tab={tab}
      setTab={handleTabChange}
      admin={admin}
    >

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <FindWorker />
          }
        />

        {/* SERVICES */}

        <Route
          path="/services"
          element={
            <Services />
          }
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={
            <RegisterWorker />
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin"
          element={
            admin
              ? (
                <AdminPanel
                  user={admin}
                />
              )
              : (
                <AdminLogin />
              )
          }
        />

        {/* FALLBACK */}

        <Route
          path="*"
          element={
            <Navigate to="/" />
          }
        />

      </Routes>

    </AppShell>

  );

}