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
} from "../types/task";

const tasksQueryKey = () => ["tasks"];

export const useTasks = () => {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery<Task[], Error>({
    queryKey: tasksQueryKey(),
    queryFn: () => getTasks(),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      const payload: CreateTaskData = { ...data } as CreateTaskData;
      return createTask(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey() });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey() });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey() });
    },
  });

  return {
    tasks,
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
