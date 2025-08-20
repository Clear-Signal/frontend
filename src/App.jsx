import { Outlet } from "react-router-dom";
import AuthProvider from "./stores/authStore";

const App = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default App;