import './App.css';
import './fonts.css';
// import cloudGif from './assets/clouds.gif';
// import BombasticText from './assets/fonts/mario';
import Landing from './components/Landing';
import { Auth0Provider } from '@auth0/auth0-react';
import { useAuth0 } from "@auth0/auth0-react";
import { Orgdashboard } from './components/org_dashboard';
const App = () => {
  const domain = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const clientId = process.env.REACT_APP_AUTH0_DOMAIN;
  
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: "http://localhost:3000"
      }}
    >
      <Landing />
      <Orgdashboard />
    </Auth0Provider>
    
  )
};

export default App;