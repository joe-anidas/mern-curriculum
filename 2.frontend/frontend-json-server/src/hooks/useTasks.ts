import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskApiJsonServer";
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFormData,
} from "../types/task";

const tasksQueryKey = (userId?: string) => ["tasks", userId];

export const useTasks = (userId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery<Task[], Error>({
    queryKey: tasksQueryKey(userId),
    queryFn: () => getTasks(userId!),
    enabled: Boolean(userId),
  });

  const scopedTasks = useMemo(() => tasks, [tasks]);

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      if (!userId) {
        throw new Error("User not found");
      }
      const payload: CreateTaskData = { ...data, userId };
      return createTask(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey(userId) });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey(userId) });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey(userId) });
    },
  });

  return {
    tasks: scopedTasks,
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
