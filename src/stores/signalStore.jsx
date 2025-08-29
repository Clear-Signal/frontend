import { createContext, useState } from "react";

const apiURL = import.meta.env.VITE_APP_URL;

export const SignalContext = createContext({});

const SignalProvider = ({ children }) => {
  return <SignalContext.Provider value={{}}>{children}</SignalContext.Provider>;
};

export default SignalProvider;
