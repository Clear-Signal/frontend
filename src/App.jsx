import { Outlet } from "react-router-dom";
import AuthProvider from "./stores/authStore";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <AuthProvider>
      <Navbar />
      <Outlet />
      <Footer />
    </AuthProvider>
  )
}

export default App;