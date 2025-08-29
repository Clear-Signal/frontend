import { Outlet } from "react-router-dom";
import { useState } from "react";
import AuthProvider from "./stores/authStore";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SignalProvider from "./stores/signalStore";

const App = () => {
  const [activeNav, setActiveNav] = useState("Home");
  return (
    <AuthProvider>
      <SignalProvider>
        <Navbar activeNav={activeNav} setActiveNav={setActiveNav} />
        <Outlet />
        <Footer />
      </SignalProvider>
    </AuthProvider>
  );
};

export default App;
