import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authService } from "@/services/api";
import { useAuthStore } from "@/store";
import { Button, Loader, ErrorMessage } from "@/components";
import { Navbar } from "@/components/common";

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login: setAuth, isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "admin@gmail.com",
      password: "password123",
    },
  });

  const { ref: passwordFieldRef, ...passwordField } = register("password", {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data);
      setAuth(response.token, response.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (email: string, password: string) => {
    setError(null);
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
    void handleSubmit(onSubmit)();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-6 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && <ErrorMessage message={error} />}

            <div className="rounded-md space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    {...passwordField}
                    ref={(el) => {
                      passwordFieldRef(el);
                      passwordInputRef.current = el;
                    }}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPassword(!showPassword);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM2 10a.5.5 0 01.5-.5h.006a.5.5 0 01.5.5v.006a.5.5 0 01-.5.5H2.5a.5.5 0 01-.5-.5V10zm10 0a.5.5 0 01.5-.5h.006a.5.5 0 01.5.5v.006a.5.5 0 01-.5.5h-.006a.5.5 0 01-.5-.5V10zM8 10a2 2 0 11-4 0 2 2 0 014 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4"
              >
                {isLoading ? <Loader /> : "Sign in"}
              </Button>
            </div>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">
                Tenant Admins
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => quickLogin("tenant1@gmail.com", "password123")}
                >
                  Tenant 1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => quickLogin("tenant2@gmail.com", "password123")}
                >
                  Tenant 2
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => quickLogin("admin@gmail.com", "password123")}
                >
                  Admin
                </Button>
              </div>

              <p className="text-xs font-semibold text-gray-600 uppercase pt-2">
                Users
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => quickLogin("user1@gmail.com", "password123")}
                  size="sm"
                >
                  User 1 (T1)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => quickLogin("user2@gmail.com", "password123")}
                  size="sm"
                >
                  User 2 (T1)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => quickLogin("user3@gmail.com", "password123")}
                  size="sm"
                >
                  User 3 (T2)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => quickLogin("user4@gmail.com", "password123")}
                  size="sm"
                >
                  User 4 (T2)
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default LoginPage;
