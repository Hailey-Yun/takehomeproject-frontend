import "mapbox-gl/dist/mapbox-gl.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "react-oidc-context";

import "./index.css";
import App from "./App.tsx";

const redirectUri = `${window.location.origin}/auth/callback`;

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_ISSUER,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: redirectUri,
  response_type: "code",
  scope: "openid email profile",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider {...cognitoAuthConfig}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
