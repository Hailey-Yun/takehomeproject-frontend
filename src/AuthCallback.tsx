import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

export default function AuthCallback() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isAuthenticated) {
      window.location.replace("/");
    }
  }, [auth.isAuthenticated]);

  if (auth.isLoading) return <div>Signing you in...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  return <div>Processing login...</div>;
}
