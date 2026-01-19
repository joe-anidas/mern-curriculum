import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleColor = (role?: string) => {
    switch(role) {
        case "tenantAdmin": return "bg-blue-600";
        case "superadmin": return "bg-purple-600";
        default: return "bg-green-600"; // User
    }
  };

  return (
    <nav className="bg-white shadow-sm z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <h1 className="text-2xl font-bold text-indigo-600">TaskFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                
                {user && (
                    <div className="relative" ref={profileRef}>
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm hover:shadow-md transition-all ${getRoleColor(user.role)}`}
                            title={user.name}
                        >
                            {getInitials(user.name)}
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            // Feature coming soon
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
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
