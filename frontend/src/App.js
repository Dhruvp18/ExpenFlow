import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import "./App.css";
import "./fonts.css";
import Landing from "./components/Landing";
import { Orgdashboard } from "./components/org_dashboard";
import Dashboard from "./components/UserDashboard";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Orgdashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/d" element={<Dashboard />} />
    </Routes>
  );
};

const App = () => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <Router>
        <AppRoutes />
      </Router>
    </Auth0Provider>
  );
};

export default App;
