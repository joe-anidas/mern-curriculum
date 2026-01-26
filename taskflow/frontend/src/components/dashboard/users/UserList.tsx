import { Button } from "@/components/ui";
import type { User } from "@/types/user";

interface UserListProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  currentUser: User | null;
  isSuperAdmin: boolean;
  isTenantAdmin: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  deletingUserId: string | null;
}

export const UserList = ({
  users,
  isLoading,
  error,
  currentUser,
  isSuperAdmin,
  isTenantAdmin,
  onEdit,
  onDelete,
  deletingUserId,
}: UserListProps) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-10 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <div className="col-span-4">Name</div>
        <div className="col-span-3">Email</div>
        <div className="col-span-1">Role</div>
        <div className="col-span-2">Actions</div>
      </div>
      <div className="divide-y divide-gray-200">
        {isLoading && <div className="px-6 py-4 text-sm text-gray-500">Loading users...</div>}
        {error && <div className="px-6 py-4 text-sm text-red-600">{error}</div>}
        {!isLoading && !error && users.length === 0 && (
          <div className="px-6 py-4 text-sm text-gray-500">No users found.</div>
        )}
        {!isLoading && !error && users.map((u) => {
          const isCurrentUser = (u.id || u._id) === currentUser?.id;
          const canEdit = isSuperAdmin || (isTenantAdmin && u.role === "user");
          const canDelete = !isCurrentUser && canEdit;

          return (
            <div key={u.id || u._id} className="grid grid-cols-10 px-6 py-4 text-sm text-gray-900 items-center hover:bg-gray-50 transition-colors">
              <div className="col-span-4 font-medium flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {u.name.charAt(0).toUpperCase()}
                </div>
                {u.name}
              </div>
              <div className="col-span-3 text-gray-700 truncate">{u.email}</div>
              <div className="col-span-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    u.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'tenantAdmin' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {u.role === 'tenantAdmin' ? 'Admin' : u.role}
                </span>
              </div>
              <div className="col-span-2 flex gap-2">
                {canEdit && <Button size="sm" variant="outline" onClick={() => onEdit(u)}>Edit</Button>}
                {canDelete && (
                  <Button size="sm" variant="destructive" onClick={() => onDelete(u.id || u._id || "")} disabled={deletingUserId === (u.id || u._id)}>
                    {deletingUserId === (u.id || u._id) ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
