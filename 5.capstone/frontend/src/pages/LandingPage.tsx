import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui";
import { Navbar } from "@/components/common";
import { useAuthStore } from "@/store";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Your Tasks
            <br />
            <span className="text-indigo-600">Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl">
            TaskFlow helps you organize, prioritize, and complete your tasks
            with ease. Boost your productivity and achieve your goals faster.
          </p>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="px-8 py-6 text-lg"
              >
                Get Started
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="px-8 py-6 text-lg"
                >
                  Get Started - Register
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="px-8 py-6 text-lg"
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
