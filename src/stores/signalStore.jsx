import { createContext, useState } from "react";

const apiURL = import.meta.env.VITE_APP_URL;

export const SignalContext = createContext({
  isDark: false,
  setIsDark: () => {},
});

const SignalProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  return <SignalContext.Provider value={{ isDark, setIsDark }}>{children}</SignalContext.Provider>;
};

export default SignalProvider;
