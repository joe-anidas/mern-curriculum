import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui";
import { UserList } from "./UserList";
import { CreateUserModal } from "../modals/CreateUserModal";
import { CreateOrganizationModal } from "../modals/CreateOrganizationModal";
import { EditUserModal } from "../modals/EditUserModal";
import { useAuthStore } from "@/store";
import { httpClient } from "@/lib/httpClient";
import { API_ENDPOINTS } from "@/config/api";
import type { User } from "@/types/user";

// Interfaces for forms
interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: "user" | "tenantAdmin" | "superadmin";
  tenantId?: string;
}

interface CreateOrgForm {
  name: string;
}

interface EditUserForm {
  name: string;
  email: string;
  role: "user" | "tenantAdmin" | "superadmin";
}

export const UserManagement = () => {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "superadmin";
  const isTenantAdmin = user?.role === "tenantAdmin";

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await httpClient.get<{ users?: User[] }>(
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

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (isSuperAdmin) return users;
    if (isTenantAdmin && user?.tenantId) {
      // Logic from DashboardPage
      return users.filter((u) => u.tenantId === user.tenantId);
    }
    return [];
  }, [users, isSuperAdmin, isTenantAdmin, user?.tenantId]);

  const handleCreateUser = async (data: CreateUserForm) => {
    setFormLoading(true);
    setFormError(null);
    try {
      // For tenant admin, ensure tenantId is set from current user (backend will use actor's tenantId anyway, but this ensures consistency)
      const payload = isTenantAdmin && user?.tenantId
        ? { ...data, tenantId: user.tenantId }
        : data;
      
      await httpClient.post(API_ENDPOINTS.AUTH.CREATE_TENANT_USER, payload);
      setSuccess(`User ${data.email} created successfully!`);
      setShowCreateUser(false);
      void loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateOrg = async (data: CreateOrgForm) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await httpClient.post(API_ENDPOINTS.AUTH.CREATE_ORGANIZATION, data);
      setSuccess(`Organization "${data.name}" created successfully!`);
      setShowCreateOrg(false);
      // We don't need to reload users, but user might want to create a user for this org immediately.
    } catch (err) {
       setFormError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (data: EditUserForm) => {
    if (!editingUser) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await httpClient.patch(
        API_ENDPOINTS.AUTH.UPDATE_USER(editingUser.id || editingUser._id || ""),
        data
      );
      setSuccess(`User ${data.email} updated successfully!`);
      setEditingUser(null);
      void loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeletingUserId(userId);
    try {
      await httpClient.delete(API_ENDPOINTS.AUTH.DELETE_USER(userId));
      setSuccess("User deleted successfully!");
      void loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
         <h2 className="text-lg font-semibold text-gray-900">
           {isSuperAdmin ? "All System Users" : "Organization Members"}
         </h2>
         <div className="flex gap-3">
           {isSuperAdmin && (
              <>
                <Button variant="outline" onClick={() => setShowCreateOrg(true)}>
                  Create Org
                </Button>
                <Button onClick={() => setShowCreateUser(true)}>
                  Create User
                </Button>
              </>
           )}
           {isTenantAdmin && (
              <Button onClick={() => setShowCreateUser(true)}>
                Create User
              </Button>
           )}
         </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
          {success}
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      <UserList
        users={filteredUsers}
        isLoading={usersLoading}
        error={usersError}
        currentUser={(user as User) || null}
        isSuperAdmin={isSuperAdmin}
        isTenantAdmin={isTenantAdmin}
        onEdit={setEditingUser}
        onDelete={handleDeleteUser}
        deletingUserId={deletingUserId}
      />

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => { 
          setShowCreateUser(false); 
          setFormError(null); 
        }}
        onSubmit={handleCreateUser}
        isLoading={formLoading}
        error={formError}
        isSuperAdmin={isSuperAdmin}
        isTenantAdmin={isTenantAdmin}
        currentTenantId={user?.tenantId || undefined}
      />

      <CreateOrganizationModal
        isOpen={showCreateOrg}
        onClose={() => { setShowCreateOrg(false); setFormError(null); }}
        onSubmit={handleCreateOrg}
        isLoading={formLoading}
        error={formError}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => { setEditingUser(null); setFormError(null); }}
        user={editingUser}
        onSubmit={handleEditUser}
        isLoading={formLoading}
        error={formError}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
};
