// Home.jsx
import React, { useContext, useEffect } from "react";
import Hero from "../components/Hero";
import LearningCards from "../components/LearningCards";
import Footer from "../components/Footer";
import WhyClearSignal from "../components/WhyClearSignal";
import { AuthContext } from "../stores/authStore";
import Lenis from "@studio-freight/lenis";

export default function Home() {
  const { setUser, navigate } = useContext(AuthContext);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // higher = more delay
      easing: (t) => 1 - Math.pow(1 - t, 3), // smooth ease-out
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const _id = params.get("_id");
    const isEmailVisible = params.get("isEmailVisible") === "true";
    const isSocialVisible = params.get("isSocialVisible") === "true";
    const isBadgeVisible = params.get("isBadgeVisible") === "true";
    const fullName = params.get("fullName");
    const email = params.get("email");
    const role = params.get("role");
    const gitHubUsername = params.get("gitHubUsername");
    const linkedInProfileURL = params.get("linkedInProfileURL");
    const kaggleUsername = params.get("kaggleUsername");
    const profilePic = params.get("profilePic");
    const flameScore = parseInt(params.get("flameScore")) || 0;
    const hasPremiumAccess = params.get("hasPremiumAccess") === "true";

    if (fullName && email && role) {
      const userData = {
        data: {
          _id,
          fullName,
          email,
          role,
          gitHubUsername,
          linkedInProfileURL,
          kaggleUsername,
          profilePic,
          flameScore,
          hasPremiumAccess,
          isEmailVisible,
          isSocialVisible,
          isBadgeVisible,
        },
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <main className="min-h-screen font-sans bg-[var(--bg-page)] text-[var(--text-default)]">
      <Hero />
      <LearningCards />
      <WhyClearSignal />
      <Footer />
    </main>
  );
}
