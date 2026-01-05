import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Loader } from "./common/Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isValidUser, setIsValidUser] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      if (!user) {
        setIsValidUser(false);
        setIsChecking(false);
        return;
      }

      try {

        const response = await fetch(
          `${import.meta.env.VITE_JSON_SERVER_API_URL}/users/${user.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to validate user");
        }

        const result = await response.json();
        const exists = Boolean(result?.id);

        if (!exists) {
          logout();
        }

        setIsValidUser(exists);
      } catch (err) {
        logout();
        setIsValidUser(false);
      } finally {
        setIsChecking(false);
      }
    };

    void verifyUser();
  }, [user, logout]);

  if (isChecking) {
    return <Loader />;
  }

  if (!isAuthenticated || !isValidUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
