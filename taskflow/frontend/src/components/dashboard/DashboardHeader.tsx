import { useState } from "react";

interface DashboardHeaderProps {
  isSuperAdmin: boolean;
  isTenantAdmin: boolean;
  activeView: "tasks" | "overview" | "users";
  setActiveView: (view: "tasks" | "overview" | "users") => void;
  orgName: string;
  onSaveOrgName: (newName: string) => Promise<void>;
  orgLabel: string;
}

export const DashboardHeader = ({
  isSuperAdmin,
  isTenantAdmin,
  activeView,
  setActiveView,
  orgName,
  onSaveOrgName,
  orgLabel,
}: DashboardHeaderProps) => {
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [orgInput, setOrgInput] = useState(orgName);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [orgSaveError, setOrgSaveError] = useState<string | null>(null);
  const [orgSaved, setOrgSaved] = useState(false);

  const handleOrgSave = async () => {
    setIsSavingOrg(true);
    setOrgSaveError(null);
    try {
      await onSaveOrgName(orgInput);
      setOrgSaved(true);
      setIsEditingOrg(false);
      setTimeout(() => setOrgSaved(false), 2000);
    } catch (err) {
        setOrgSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSavingOrg(false);
    }
  };

  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">
          {isSuperAdmin ? "System Administration" : "Tenant Dashboard"}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {activeView === "overview" ? "Analytics Overview" : activeView === "users" ? "User Management" : "Task Tracker"}
        </h1>

        {!isSuperAdmin && (
          <div className="text-gray-600 mt-2 flex items-center gap-2 text-sm">
            <span className="bg-gray-50 px-2 py-1 rounded border border-gray-200 shadow-sm text-gray-700 font-medium">
              {isEditingOrg ? "Editing..." : orgLabel}
            </span>

            {isEditingOrg ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <input
                  value={orgInput}
                  onChange={(e) => setOrgInput(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none w-40"
                  placeholder="Org Name"
                  disabled={isSavingOrg}
                  autoFocus
                />
                <button
                  onClick={handleOrgSave}
                  disabled={isSavingOrg}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 text-xs uppercase tracking-wide"
                >
                  {isSavingOrg ? "Sav..." : "Save"}
                </button>
                <button
                  onClick={() => { setIsEditingOrg(false); setOrgInput(orgName); }}
                  disabled={isSavingOrg}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 text-xs uppercase tracking-wide"
                >
                  Cancel
                </button>
                {orgSaveError && <span className="text-red-600 text-xs">{orgSaveError}</span>}
              </div>
            ) : (
              <button
                onClick={() => { setIsEditingOrg(true); setOrgInput(orgName); }}
                className="text-gray-400 hover:text-blue-600 transition-colors bg-transparent p-1 rounded hover:bg-gray-100"
                title="Rename Organization"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
             {orgSaved && <span className="text-green-600 text-xs animate-pulse">Saved!</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
        {/* Task Tracker Button (First) */}
        {!isSuperAdmin && (
             <button
            onClick={() => setActiveView("tasks")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === "tasks"
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            Task Tracker
          </button>
        )}

        {isTenantAdmin && (
          <button
            onClick={() => setActiveView("overview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === "overview"
                ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
           Analytics
          </button>
        )}

        <button
          onClick={() => setActiveView("users")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeView === "users"
              ? "bg-white text-blue-700 shadow-sm ring-1 ring-black/5"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
          }`}
        >
          Users
        </button>
      </div>
    </header>
  );
};
