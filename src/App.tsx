import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import AuthCallback from "./AuthCallback";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}
