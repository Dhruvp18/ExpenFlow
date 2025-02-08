import './App.css';
import './fonts.css';
import Landing from './components/Landing';
import { Auth0Provider } from '@auth0/auth0-react';
import { useAuth0 } from "@auth0/auth0-react";
import { Orgdashboard } from './components/org_dashboard';

// Create a wrapper component to handle authentication logic
const MainApp = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  // Show a loading indicator while checking authentication state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to Orgdashboard if authenticated, otherwise show Landing
  return isAuthenticated ? <Orgdashboard /> : <Landing />;
};

const App = () => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN; // Corrected variable name
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID; // Corrected variable name

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin // Use the current origin dynamically
      }}
    >
      <MainApp />
    </Auth0Provider>
  );
};

export default App;