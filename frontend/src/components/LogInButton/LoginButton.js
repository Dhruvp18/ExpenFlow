import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = (props) => {
  const { loginWithRedirect } = useAuth0();
  return (
    <button 
      onClick={() => loginWithRedirect({ redirectUri: `http://localhost:3000/${props.link}` })}
      className={props.design}
    >
      {props.icon}
      {props.name}
    </button>
  );
};

export default LoginButton;