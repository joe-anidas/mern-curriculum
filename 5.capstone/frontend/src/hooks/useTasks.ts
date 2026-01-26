import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/api";
import { getErrorMessage } from "@/types/errors";
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFormData,
  TaskQueryParams,
} from "../types/task";

type UserRole = "superadmin" | "tenantAdmin" | "user";

type UseTasksContext = {
  userId?: string;
  tenantId?: string | null;
  role?: UserRole;
};

const tasksQueryKey = (context?: UseTasksContext, params?: TaskQueryParams) => [
  "tasks",
  context?.tenantId ?? "self",
  context?.userId ?? "self",
  context?.role ?? "user",
  params?.page ?? 1,
  params?.limit ?? 6,
  params?.q ?? "",
  params?.status ?? "all",
];

export const useTasks = (context?: UseTasksContext) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Task["status"]>("all");

  const tenantId = context?.tenantId ?? undefined;
  const userId = context?.userId ?? undefined;
  const role = context?.role ?? "user";

  const isQueryEnabled =
    role === "superadmin" ? true : Boolean(tenantId || userId);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: tasksQueryKey(context, { page, limit, q, status }),
    queryFn: () =>
      taskService.getTasks({
        page,
        limit,
        q,
        status,
        tenantId,
        userId: role === "user" ? userId : undefined,
      }),
    enabled: isQueryEnabled,
  });

  const tasks = useMemo(() => data?.tasks ?? [], [data]);
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const errorMessage = error ? getErrorMessage(error) : null;

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      const payload: CreateTaskData = { ...data } as CreateTaskData;
      if (tenantId) {
        payload.tenantId = tenantId;
      }
      // Only set userId from context if it's not already provided in the data
      // This allows tenant admins to assign tasks to other users
      if (role !== "user" && userId && !payload.userId) {
        payload.userId = userId;
      }
      return taskService.createTask(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey(context, { page, limit, q, status }),
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey(context, { page, limit, q, status }),
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey(context, { page, limit, q, status }),
      });
    },
  });

  const setSearch = useCallback((value: string) => {
    setPage(1);
    setQ(value);
  }, []);

  const setStatusFilter = useCallback((value: "all" | Task["status"]) => {
    setPage(1);
    setStatus(value);
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  return {
    tasks,
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setSearch,
    setStatusFilter,
    nextPage,
    prevPage,
    isLoading,
    isError,
    error: errorMessage,

    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,

    createError: createTaskMutation.error
      ? getErrorMessage(createTaskMutation.error)
      : null,
    updateError: updateTaskMutation.error
      ? getErrorMessage(updateTaskMutation.error)
      : null,
    deleteError: deleteTaskMutation.error
      ? getErrorMessage(deleteTaskMutation.error)
      : null,

    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    refetch,
  };
};
