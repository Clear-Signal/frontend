import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import LearningCards from "../components/LearningCards";
import WhyClearSignal from "../components/WhyClearSignal";
import { useContext, useEffect } from "react";
import { AuthContext } from "../stores/authStore";

const Home = () => {
  const { setUser, navigate } = useContext(AuthContext);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const name = params.get("name");
    const email = params.get("email");
    const role = params.get("role");

    if (name && email && role) {
      const userData = {data:{ fullName: name, email, role }};

      setUser(userData);

      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/", { replace: true });
    }
  }, [navigate]);
  return (
    <main className="w-full min-h-screen bg-[var(--color-bg)]">
      <Hero />
      <LearningCards />
      <WhyClearSignal />
    </main>
  );
};
export default Home;
