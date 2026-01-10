import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Navbar } from "@/components/common";
import { Button } from "@/components/ui";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@/components";
import { httpClient } from "@/lib/httpClient";
import { API_ENDPOINTS } from "@/config/api";

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: "user" | "tenantAdmin" | "superadmin";
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "superadmin";
  const isTenantAdmin = user?.role === "tenantAdmin";
  const ORG_NAME_KEY = "org-name-display";
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("Your Organization");
  const [orgInput, setOrgInput] = useState("");
  const [orgSaved, setOrgSaved] = useState(false);
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [orgSaveError, setOrgSaveError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role === "user") {
      navigate("/tasks", { replace: true });
    }
    const storedOrg = localStorage.getItem(ORG_NAME_KEY);
    if (storedOrg) {
      setOrgName(storedOrg);
      setOrgInput(storedOrg);
    } else {
      setOrgInput("Your Organization");
    }
    void loadOrganization();
    void loadUsers();
  }, [user, navigate]);

  const loadOrganization = async () => {
    try {
      const data = await httpClient.get<{
        organization?: { name: string } | null;
      }>(API_ENDPOINTS.AUTH.ORGANIZATION);
      const next = data.organization?.name || orgName;
      setOrgName(next);
      setOrgInput(next);
      localStorage.setItem(ORG_NAME_KEY, next);
    } catch (err) {
      console.warn("Failed to fetch organization", err);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await httpClient.get<{ users?: any[] }>(
        API_ENDPOINTS.AUTH.USERS
      );
      setUsers(data.users || []);
    } catch (err) {
      setUsersError(
        err instanceof Error ? err.message : "Failed to load users"
      );
    } finally {
      setUsersLoading(false);
    }
  };

  const handleOrgSave = async () => {
    const next = orgInput.trim() || "Your Organization";
    setIsSavingOrg(true);
    setOrgSaveError(null);

    try {
      await httpClient.patch(API_ENDPOINTS.AUTH.ORGANIZATION, {
        name: next,
        tenantId: user?.tenantId,
      });
      setOrgName(next);
      localStorage.setItem(ORG_NAME_KEY, next);
      setOrgSaved(true);
      setIsEditingOrg(false);
      setTimeout(() => setOrgSaved(false), 2000);
    } catch (err) {
      setOrgSaveError(
        err instanceof Error ? err.message : "Failed to save organization"
      );
    } finally {
      setIsSavingOrg(false);
    }
  };

  const onSubmit = async (data: CreateUserForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await httpClient.post(API_ENDPOINTS.AUTH.CREATE_TENANT_USER, data);

      setSuccess(`User ${data.email} created successfully!`);
      reset();
      setShowCreateUser(false);
      void loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || (!isSuperAdmin && !isTenantAdmin)) {
    return null;
  }

  const orgLabel = orgName || user?.tenantId || "Your Organization";

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (isSuperAdmin) return users;
    if (isTenantAdmin && user?.tenantId) {
      return users.filter((u) => u.tenantId === user.tenantId);
    }
    return [];
  }, [users, isSuperAdmin, isTenantAdmin, user?.tenantId]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Dashboard</p>
              <h1 className="text-3xl font-bold text-gray-900">
                {isSuperAdmin ? "User Management" : "Tenant Dashboard"}
              </h1>
              {!isSuperAdmin && (
                <div className="text-gray-600 mt-1 flex flex-wrap items-center gap-3">
                  <span>
                    Organization:{" "}
                    <span className="font-semibold text-gray-900">
                      {orgLabel}
                    </span>
                  </span>
                  {isEditingOrg && !isSuperAdmin ? (
                    <>
                      <input
                        value={orgInput}
                        onChange={(e) => setOrgInput(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter organization name"
                        disabled={isSavingOrg}
                      />
                      <Button
                        size="sm"
                        onClick={handleOrgSave}
                        disabled={isSavingOrg}
                      >
                        {isSavingOrg ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOrgInput(orgName);
                          setIsEditingOrg(false);
                          setOrgSaved(false);
                          setOrgSaveError(null);
                        }}
                        disabled={isSavingOrg}
                      >
                        Cancel
                      </Button>
                      {orgSaved && (
                        <span className="text-sm text-green-600">✓ Saved</span>
                      )}
                      {orgSaveError && (
                        <span className="text-sm text-red-600">
                          {orgSaveError}
                        </span>
                      )}
                    </>
                  ) : !isSuperAdmin ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setOrgInput(orgName);
                        setIsEditingOrg(true);
                      }}
                    >
                      Edit
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate("/tasks")}>
                Task Management
              </Button>
              <Button
                onClick={() =>
                  isSuperAdmin
                    ? setShowCreateUser(!showCreateUser)
                    : setShowCreateUser(false)
                }
                disabled={!isSuperAdmin}
              >
                {showCreateUser && isSuperAdmin ? "Cancel" : "User Management"}
              </Button>
            </div>
          </header>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {showCreateUser && isSuperAdmin && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Create New User
              </h2>
              {error && <ErrorMessage message={error} />}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    {...registerField("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    id="name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    {...registerField("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="user@example.com"
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
                  <input
                    {...registerField("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    id="password"
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role
                  </label>
                  <select
                    {...registerField("role", {
                      required: "Role is required",
                    })}
                    id="role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a role</option>
                    <option value="user">User</option>
                    <option value="tenantAdmin">Tenant Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create User"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateUser(false);
                      reset();
                      setError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-3">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2">Tenant</div>
            </div>
            <div className="divide-y divide-gray-200">
              {usersLoading && (
                <div className="px-6 py-4 text-sm text-gray-500">
                  Loading users...
                </div>
              )}
              {usersError && (
                <div className="px-6 py-4 text-sm text-red-600">
                  {usersError}
                </div>
              )}
              {!usersLoading && !usersError && filteredUsers.length === 0 && (
                <div className="px-6 py-4 text-sm text-gray-500">
                  No users found.
                </div>
              )}
              {!usersLoading &&
                !usersError &&
                filteredUsers.map((u) => (
                  <div
                    key={u.id || u._id}
                    className="grid grid-cols-12 px-6 py-4 text-sm text-gray-900"
                  >
                    <div className="col-span-3 font-medium">{u.name}</div>
                    <div className="col-span-4 text-gray-700">{u.email}</div>
                    <div className="col-span-3">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {u.role}
                      </span>
                    </div>
                    <div className="col-span-2 text-gray-700">
                      {u.tenantId || orgLabel}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
