import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Loader } from "@/components/common";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";

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
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to validate user");
        }

        const result = await response.json();
        const exists = Boolean(result?.user?.id);

        if (!exists) {
          logout();
        }

        setIsValidUser(exists);
      } catch {
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
