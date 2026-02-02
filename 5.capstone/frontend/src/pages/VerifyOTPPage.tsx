import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, Loader, ErrorMessage } from "@/components";
import { Navbar } from "@/components/common";
import { API_BASE_URL } from "@/config/api";

interface VerifyOTPFormData {
  otp: string;
}

export const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(600); // 10 minutes

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOTPFormData>();

  // Timer for OTP expiration
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const onSubmit = async (data: VerifyOTPFormData) => {
    if (!email) {
      setError("Email is missing. Please start again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: data.otp }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "OTP verification failed");
        return;
      }

      // Store reset token and navigate to password reset page
      localStorage.setItem("resetToken", result.resetToken);
      navigate("/reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!email) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-6 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <p className="text-red-600 mb-4">
              Email not found. Please try again.
            </p>
            <Button onClick={() => navigate("/forgot-password")}>
              Back to Forgot Password
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-6 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Verify OTP
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit code to <br />
              <span className="font-medium">{email}</span>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && <ErrorMessage message={error} />}

            <div className="rounded-md space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter OTP
                </label>
                <input
                  {...register("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "OTP must be 6 digits",
                    },
                  })}
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.otp.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                OTP expires in:{" "}
                <span className="font-semibold text-blue-600">
                  {formatTime(timer)}
                </span>
              </span>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4"
              >
                {isLoading ? <Loader /> : "Verify OTP"}
              </Button>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/forgot-password")}
                className="w-full"
              >
                Request New OTP
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default VerifyOTPPage;
