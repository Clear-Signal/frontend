// App.jsx
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import AuthProvider from "./stores/authStore";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Lenis from "@studio-freight/lenis";

const App = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,   // higher = more delay
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

  return (
    <AuthProvider>
      <Navbar />
      <Outlet />
      <Footer />
    </AuthProvider>
  );
};

export default App;
