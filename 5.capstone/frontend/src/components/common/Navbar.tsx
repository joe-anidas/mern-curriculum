import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <h1 className="text-2xl font-bold text-indigo-600">TaskFlow</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user && (
                  <span className="text-sm text-gray-600 hidden sm:block">
                    Welcome, {user.name}
                  </span>
                )}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="px-6"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="px-6"
                >
                  Login
                </Button>
                <Button onClick={() => navigate("/register")} className="px-6">
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
