import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If sign-in is complete, go back home
    if (auth.isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  if (auth.isLoading) return <div style={{ padding: 16 }}>Signing you in...</div>;
  if (auth.error) return <div style={{ padding: 16, color: "crimson" }}>Auth error: {auth.error.message}</div>;

  // During redirect processing
  return <div style={{ padding: 16 }}>Processing callback...</div>;
}
