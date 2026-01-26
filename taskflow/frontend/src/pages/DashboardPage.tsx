import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Navbar } from "@/components/common";
import { httpClient } from "@/lib/httpClient";
import { API_ENDPOINTS } from "@/config/api";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { UserManagement } from "@/components/dashboard/users/UserManagement";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tasks } from "@/components/features/tasks";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "superadmin";
  const isTenantAdmin = user?.role === "tenantAdmin";
  const ORG_NAME_KEY = "org-name-display";
  
  const [activeView, setActiveView] = useState<"tasks" | "overview" | "users">(
    isSuperAdmin ? "users" : "tasks"
  );
  
  const [orgName, setOrgName] = useState(() => {
    return localStorage.getItem(ORG_NAME_KEY) || "Your Organization";
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    // Standard User Redirect
    if (user.role === "user") {
      navigate("/tasks", { replace: true });
      return;
    }

    const loadOrganization = async () => {
      try {
        const data = await httpClient.get<{
          organization?: { name: string } | null;
        }>(API_ENDPOINTS.AUTH.ORGANIZATION);
        
        if (data.organization?.name) {
          setOrgName(data.organization.name);
          localStorage.setItem(ORG_NAME_KEY, data.organization.name);
        }
      } catch (err) {
        console.warn("Failed to fetch organization", err);
      }
    };

    void loadOrganization();
  }, [user, navigate]);

  const handleOrgSave = async (newName: string) => {
    const next = newName.trim() || "Your Organization";
    await httpClient.patch(API_ENDPOINTS.AUTH.ORGANIZATION, {
      name: next,
      tenantId: user?.tenantId,
    });
    setOrgName(next);
    localStorage.setItem(ORG_NAME_KEY, next);
  };

  if (!user || (!isSuperAdmin && !isTenantAdmin)) {
    return null;
  }

  const orgLabel = orgName || user?.tenantId || "Your Organization";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50/50 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardHeader 
            isSuperAdmin={isSuperAdmin}
            isTenantAdmin={isTenantAdmin}
            activeView={activeView}
            setActiveView={setActiveView}
            orgName={orgName}
            onSaveOrgName={handleOrgSave}
            orgLabel={orgLabel}
          />

          {/* CONTENT AREA */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeView === "tasks" && !isSuperAdmin && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
                 <Tasks /> 
              </div>
            )}

            {activeView === "overview" && isTenantAdmin && (
              <AnalyticsDashboard />
            )}

            {activeView === "users" && (
              <UserManagement />
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;
