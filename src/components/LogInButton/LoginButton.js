import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <button 
      onClick={() => loginWithRedirect()}
      className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300"
    >
      Log In
    </button>
  );
};

export default LoginButton;