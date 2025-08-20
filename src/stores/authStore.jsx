import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_APP_URL;

export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateUser: () => {},
  error: null,
  loading: false,
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/api/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      setError(
        error.response ? error.response.data.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/api/auth/register`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      setError(
        error.response ? error.response.data.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${apiUrl}/api/auth/logout`);
      console.log(response.data);
      setUser(null);
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error(error);
      setError(
        error.response ? error.response.data.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedData, setMsg) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `${apiUrl}/api/user/profile`,
        updatedData,
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        setMsg({ type: "success", text: "Profile updated." });
      }
    } catch (error) {
      console.error(error);
      setError(
        error.response ? error.response.data.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, updateUser, error, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
