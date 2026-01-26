import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui";
import { ErrorMessage } from "@/components";
import { useEffect, useState } from "react";
import { httpClient } from "@/lib/httpClient";
import { API_ENDPOINTS } from "@/config/api";

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: "user" | "tenantAdmin" | "superadmin";
  tenantId?: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserForm) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isSuperAdmin?: boolean;
  isTenantAdmin?: boolean;
  currentTenantId?: string;
}

export const CreateUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  isSuperAdmin = false,
  isTenantAdmin = false,
  currentTenantId,
}: CreateUserModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    getValues,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>();

  const [organizations, setOrganizations] = useState<{ id: string; name: string; hasTenantAdmin?: boolean }[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [selectedOrgName, setSelectedOrgName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const selectedRole = useWatch({ control, name: "role" });

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === "tenantAdmin") {
      const currentTenantId = getValues("tenantId");
      if (currentTenantId) {
        const currentOrg = organizations.find(o => o.id === currentTenantId);
        if (currentOrg?.hasTenantAdmin) {
           setValue("tenantId", undefined);
           setSelectedOrgName("");
           setSearchQuery("");
        }
      }
    }
  };

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If creating a tenant admin, exclude organizations that already have one
    if (selectedRole === "tenantAdmin" && org.hasTenantAdmin) {
      return false;
    }

    return matchesSearch;
  });

  useEffect(() => {
    if (isOpen && isSuperAdmin) {
      const fetchOrgs = async () => {
        setOrgsLoading(true);
        try {
          const { organizations } = await httpClient.get<{ organizations: { id: string; name: string; hasTenantAdmin?: boolean }[] }>(
             API_ENDPOINTS.AUTH.ALL_ORGANIZATIONS
          );
          setOrganizations(organizations || []);
        } catch (err) {
          console.error("Failed to load organizations", err);
        } finally {
          setOrgsLoading(false);
        }
      };
      
      void fetchOrgs();
    }
    
    // For tenant admin, auto-set the tenantId and role
    if (isOpen && isTenantAdmin && currentTenantId) {
      setValue("tenantId", currentTenantId);
      setValue("role", "user"); // Tenant admins can only create regular users
    }
    
    // Reset password visibility when modal closes
    if (!isOpen) {
      setShowPassword(false);
    }
  }, [isOpen, isSuperAdmin, isTenantAdmin, currentTenantId, setValue]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: CreateUserForm) => {
    // For tenant admin, ensure role is 'user' and tenantId is set
    const submitData: CreateUserForm = isTenantAdmin && currentTenantId
      ? { ...data, role: "user", tenantId: currentTenantId }
      : data;
    
    await onSubmit(submitData);
    if (!error) {
      reset();
      setSearchQuery("");
      setSelectedOrgName("");
      setShowPassword(false);
      // Reset tenantId for tenant admin
      if (isTenantAdmin && currentTenantId) {
        setValue("tenantId", currentTenantId);
        setValue("role", "user");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white shadow-xl border border-gray-200 rounded-xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && <ErrorMessage message={error} />}
        
        <div className="flex gap-3 mb-4">
          <Button 
            type="button" 
            variant="outline" 
            className="text-xs h-8"
            onClick={() => {
              setValue("name", "Demo User");
              setValue("email", `user.${Date.now()}@test.com`);
              setValue("password", "password123");
              setValue("role", "user");
            }}
          >
            Demo User
          </Button>
          {isSuperAdmin && (
            <Button 
              type="button" 
              variant="outline" 
              className="text-xs h-8"
              onClick={() => {
                setValue("name", "Demo Admin");
                setValue("email", `admin.${Date.now()}@test.com`);
                setValue("password", "password123");
                setValue("role", "tenantAdmin", { shouldValidate: true });
                
                // Auto-select a valid organization for demo
                if (organizations.length > 0) {
                   const validOrg = organizations.find(o => !o.hasTenantAdmin);
                   if (validOrg) {
                      setValue("tenantId", validOrg.id, { shouldValidate: true });
                      setSelectedOrgName(validOrg.name);
                      setSearchQuery(validOrg.name);
                   } else {
                      // Fallback if all have admins
                      alert("All existing organizations already have a Tenant Admin. To create a new Tenant Admin, you must first create a new Organization.");
                   }
                }
              }}
            >
              Demo Tenant Admin
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              })}
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Enter full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
              })}
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="user@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                })}
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter password"
              />
              <button
                type="button"
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
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              {...register("role", { 
                required: "Role is required",
                onChange: handleRoleChange
              })}
              id="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              disabled={isTenantAdmin} // Tenant admins can only create users
            >
              <option value="">Select a role</option>
              <option value="user">User</option>
              {isSuperAdmin && <option value="tenantAdmin">Tenant Admin</option>}
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            {isTenantAdmin && (
              <p className="mt-1 text-sm text-gray-500">
                Tenant admins can only create regular users in their organization
              </p>
            )}
          </div>

          {isSuperAdmin && !isTenantAdmin && (
            <div className="relative">
              <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              {/* Hidden input to hold the actual ID */}
              <input 
                type="hidden" 
                {...register("tenantId", { required: isSuperAdmin ? "Organization is required" : false })} 
              />
              
              <div className="relative">
                <input
                  type="text"
                  value={selectedOrgName || searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedOrgName(""); // Clear selection on type
                    setValue("tenantId", undefined); // Clear form value
                    setShowOrgDropdown(true);
                  }}
                  onFocus={() => setShowOrgDropdown(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder={orgsLoading ? "Loading organizations..." : "Type to search organization..."}
                  disabled={orgsLoading}
                  autoComplete="off"
                />
                {orgsLoading && (
                   <div className="absolute right-3 top-2.5">
                     <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                   </div>
                )}
              </div>

              {showOrgDropdown && searchQuery && !selectedOrgName && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredOrgs.length > 0 ? (
                    filteredOrgs.map((org) => (
                      <button
                        type="button"
                        key={org.id}
                        onClick={() => {
                          setValue("tenantId", org.id);
                          setSelectedOrgName(org.name);
                          setSearchQuery(org.name); // Set display to name
                          setShowOrgDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                      >
                        {org.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No organizations found</div>
                  )}
                </div>
              )}
              {errors.tenantId && <p className="mt-1 text-sm text-red-600">{errors.tenantId.message}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create User"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
