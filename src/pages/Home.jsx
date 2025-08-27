// Home.jsx
import React, { useContext, useEffect } from "react";
import Hero from "../components/Hero";
import LearningCards from "../components/LearningCards";
import WhyClearSignal from "../components/WhyClearSignal";
import { AuthContext } from "../stores/authStore";

export default function Home() {
  const { setUser, navigate } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fullName = params.get("fullName");
    const email = params.get("email");
    const role = params.get("role");
    const gitHubUsername = params.get("gitHubUsername");
    const linkedInProfileURL = params.get("linkedInProfileURL");
    const kaggleUsername = params.get("kaggleUsername");
    const profilePic = params.get("profilePic");

    if (fullName && email && role) {
      const userData = {
        data: { fullName, email, role, gitHubUsername, linkedInProfileURL, kaggleUsername, profilePic },
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <main className="min-h-screen font-sans bg-[var(--bg-page)] text-[var(--text-default)]">
      <Hero />
      <LearningCards />
      <WhyClearSignal />
    </main>
  );
}
