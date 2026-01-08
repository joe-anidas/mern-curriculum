import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Loader } from "./common/Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, token, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isValidUser, setIsValidUser] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsValidUser(false);
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to validate token");
        }

        const result = await response.json();
        const ok = Boolean(result?.success);

        if (!ok) {
          logout();
        }

        setIsValidUser(ok);
      } catch (err) {
        logout();
        setIsValidUser(false);
      } finally {
        setIsChecking(false);
      }
    };

    void verifyUser();
  }, [token, logout]);

  if (isChecking) {
    return <Loader />;
  }

  if (!isAuthenticated || !isValidUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
