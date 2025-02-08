import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout } = useAuth0();
  return (
    <button 
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300"
    >
      Log Out
    </button>
  );
};

export default LogoutButton;