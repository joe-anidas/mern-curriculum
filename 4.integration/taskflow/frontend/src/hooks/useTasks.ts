import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskApi";
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFormData,
  TaskQueryParams,
} from "../types/task";

const tasksQueryKey = (params?: TaskQueryParams) => [
  "tasks",
  params?.page ?? 1,
  params?.limit ?? 3,
  params?.q ?? "",
  params?.status ?? "all",
];

export const useTasks = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(3);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Task["status"]>("all");

  // Fetch current page of tasks
  const { data, isLoading, isError, error } = useQuery({
    queryKey: tasksQueryKey({ page, limit, q, status }),
    queryFn: () => getTasks({ page, limit, q, status }),
  });

  // Fetch total counts for each status
  const { data: allTasksData } = useQuery({
    queryKey: ["tasks-all", q],
    queryFn: () => getTasks({ page: 1, limit: 1000, q, status: "all" }),
  });

  const { data: todoData } = useQuery({
    queryKey: ["tasks-todo", q],
    queryFn: () => getTasks({ page: 1, limit: 1000, q, status: "todo" }),
  });

  const { data: inProgressData } = useQuery({
    queryKey: ["tasks-in-progress", q],
    queryFn: () => getTasks({ page: 1, limit: 1000, q, status: "in-progress" }),
  });

  const { data: completedData } = useQuery({
    queryKey: ["tasks-completed", q],
    queryFn: () => getTasks({ page: 1, limit: 1000, q, status: "completed" }),
  });

  const tasks = useMemo(() => data?.tasks ?? [], [data]);
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const taskCounts = useMemo(
    () => ({
      all: allTasksData?.total ?? 0,
      todo: todoData?.total ?? 0,
      "in-progress": inProgressData?.total ?? 0,
      completed: completedData?.total ?? 0,
    }),
    [allTasksData, todoData, inProgressData, completedData]
  );

  const invalidateCountQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks-all"] });
    queryClient.invalidateQueries({ queryKey: ["tasks-todo"] });
    queryClient.invalidateQueries({ queryKey: ["tasks-in-progress"] });
    queryClient.invalidateQueries({ queryKey: ["tasks-completed"] });
  };

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      const payload: CreateTaskData = { ...data } as CreateTaskData;
      return createTask(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey({ page, limit, q, status }),
      });
      invalidateCountQueries();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey({ page, limit, q, status }),
      });
      invalidateCountQueries();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: async () => {
      // Invalidate all queries to get fresh data
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey({ page, limit, q, status }),
      });
      invalidateCountQueries();

      // Wait for refetch to complete
      await queryClient.refetchQueries({
        queryKey: tasksQueryKey({ page, limit, q, status }),
      });

      // Check the refetched data
      const refetchedData = queryClient.getQueryData(
        tasksQueryKey({ page, limit, q, status })
      ) as any;

      if (refetchedData) {
        // If current page has no tasks and we're not on page 1, move to previous page
        if (
          refetchedData.tasks?.length === 0 &&
          refetchedData.page > 1 &&
          page > 1
        ) {
          setPage((p) => Math.max(1, p - 1));
        }
      }
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
    setPage((p) => {
      // Prevent going beyond total pages
      const nextPageNum = p + 1;
      return nextPageNum <= (totalPages || 1) ? nextPageNum : p;
    });
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  return {
    tasks,
    page,
    limit,
    total,
    totalPages,
    taskCounts,
    status,
    setPage,
    setLimit,
    setSearch,
    setStatusFilter,
    nextPage,
    prevPage,
    isLoading,
    isError,
    error,

    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,

    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};
