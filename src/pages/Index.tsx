import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import LandingPage from "./LandingPage";

const Index = () => {
  const user = useAppSelector((state) => state.auth.user);

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show landing page for non-authenticated users
  return <LandingPage />;
};

export default Index;
