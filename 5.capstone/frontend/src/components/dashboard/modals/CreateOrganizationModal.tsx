import { useForm } from "react-hook-form";
import { Button } from "@/components/ui";
import { ErrorMessage } from "@/components";

interface CreateOrganizationForm {
  name: string;
}

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrganizationForm) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const CreateOrganizationModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
}: CreateOrganizationModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrganizationForm>();

  if (!isOpen) return null;

  const handleFormSubmit = async (data: CreateOrganizationForm) => {
    await onSubmit(data);
    if (!error) reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white shadow-xl border border-gray-200 rounded-xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Organization</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && <ErrorMessage message={error} />}
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              {...register("name", {
                required: "Organization Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
                maxLength: { value: 100, message: "Name cannot exceed 100 characters" },
              })}
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="e.g. Acme Corp"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="flex gap-3 pt-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Organization"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
