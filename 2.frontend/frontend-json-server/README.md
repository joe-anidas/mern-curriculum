# TaskFlow - Comprehensive Documentation

> A modern task management application built with React 19, TypeScript, and professional frontend development patterns.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Application Routes](#application-routes)
4. [Architecture & Project Structure](#architecture--project-structure)
5. [Core Concepts](#core-concepts)
6. [API Documentation](#api-documentation)
7. [Component Reference](#component-reference)
8. [State Management](#state-management)
9. [Hooks Reference](#hooks-reference)
10. [Type Definitions](#type-definitions)

---

## Tech Stack

| Category             | Technology      | Version      | Purpose                      |
| -------------------- | --------------- | ------------ | ---------------------------- |
| **Frontend**         | React           | 19.2.0       | UI Library                   |
| **Language**         | TypeScript      | 5.9.3        | Type Safety                  |
| **Build Tool**       | Vite            | 7.3.0        | Fast Development & Bundling  |
| **Routing**          | React Router    | 7.11.0       | Client-side Routing          |
| **State Management** | Zustand         | 5.0.9        | Global State (Auth)          |
| **Server State**     | TanStack Query  | 5.90.12      | Async State & Caching        |
| **Forms**            | React Hook Form | 7.69.0       | Form Management & Validation |
| **Styling**          | Tailwind CSS    | 4.1.18       | Utility-first CSS            |
| **UI Components**    | shadcn/ui       | -            | Accessible Components        |
| **Backend**          | JSON Server     | 1.0.0-beta.1 | Mock REST API                |

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd taskflow-frontend

# Install dependencies
npm install
```

### Development

```bash
# Run both frontend and JSON Server concurrently
npm run dev:with-server

# Or run them separately:
# Terminal 1 - JSON Server (http://localhost:3000)
npm run server

# Terminal 2 - Vite dev server (http://localhost:5173)
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Application Routes

### Route Structure

```
/ (root)
├── /login              → LoginPage (Public)
├── /register           → RegisterPage (Public)
├── /tasks              → TasksPage (Protected)
└── * (catch-all)       → Redirect to /login
```

### Route Configuration

**File:** [src/App.tsx](src/App.tsx)

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Page Details

#### 1. Login Page (`/login`)

**File:** [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx)

**Purpose:** User authentication

**Features:**

- Email & password validation
- Error handling
- Auto-redirect to `/tasks` on success
- Link to register page

**Code Example:**

```tsx
const handleLogin = async (data: { email: string; password: string }) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await login(data);
    authLogin(response.user);
    navigate("/tasks", { replace: true });
  } catch (err) {
    setError(err instanceof Error ? err.message : "Login failed");
  } finally {
    setIsLoading(false);
  }
};
```

#### 2. Register Page (`/register`)

**File:** [src/pages/RegisterPage.tsx](src/pages/RegisterPage.tsx)

**Purpose:** New user registration

**Features:**

- Name, email, password validation
- Password confirmation
- Auto-login after registration
- Link to login page

#### 3. Tasks Page (`/tasks`) - Protected

**File:** [src/pages/TasksPage.tsx](src/pages/TasksPage.tsx)

**Purpose:** Main task management interface

**Features:**

- View all tasks
- Create new tasks
- Edit existing tasks
- Delete tasks
- Filter by status (All, To Do, In Progress, Completed)
- Logout functionality

**Code Example:**

```tsx
export default function TasksPage() {
  const { user, logout } = useAuthStore();

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </header>

        <Tasks userId={user?.id} />
      </div>
    </PageLayout>
  );
}
```

---

## Architecture & Project Structure

### Directory Structure

```
taskflow-frontend/
├── public/
│   └── robots.txt
├── src/
│   ├── api/                    # API layer - HTTP requests
│   │   ├── authApi.ts          # Authentication endpoints
│   │   └── taskApiJsonServer.ts # Task CRUD endpoints
│   ├── components/             # React components
│   │   ├── common/             # Shared utilities
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── Loader.tsx
│   │   ├── tasks/              # Task feature components
│   │   │   ├── TaskCard.tsx    # Single task display
│   │   │   ├── TaskForm.tsx    # Create/Edit form
│   │   │   ├── TaskList.tsx    # Task list with filters
│   │   │   └── Tasks.tsx       # Task container
│   │   ├── ui/                 # Design system components
│   │   │   └── button.tsx      # Reusable button
│   │   └── ProtectedRoute.tsx  # Route authentication HOC
│   ├── data/
│   │   └── db.json             # JSON Server database
│   ├── hooks/                  # Custom React hooks
│   │   └── useTasks.ts         # Task operations hook
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── pages/                  # Page components (routes)
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── TasksPage.tsx
│   ├── store/                  # Zustand state stores
│   │   └── authStore.ts        # Authentication state
│   ├── types/                  # TypeScript definitions
│   │   └── task.ts             # Task type definitions
│   ├── App.tsx                 # Root component & routing
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json                 # Deployment config
```

### Design Patterns

#### 1. **Feature-based Organization**

Components are organized by feature (tasks, auth) rather than by type.

#### 2. **Separation of Concerns**

- **API Layer**: Handles all HTTP requests
- **Components**: Pure UI logic
- **Hooks**: Business logic & data fetching
- **Store**: Global state management
- **Types**: Centralized type definitions

#### 3. **Code Splitting**

Lazy loading for all pages to improve initial load time.

```tsx
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
```

---

## Core Concepts

### 1. React Hooks Implementation

#### useState - Local State

**Usage in:** [src/components/tasks/TaskList.tsx](src/components/tasks/TaskList.tsx)

```tsx
import { useState } from "react";

const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setFilter("all")}>All</Button>
        <Button onClick={() => setFilter("todo")}>To Do</Button>
        <Button onClick={() => setFilter("in-progress")}>In Progress</Button>
        <Button onClick={() => setFilter("completed")}>Completed</Button>
      </div>
      {/* Filtered tasks display */}
    </div>
  );
};
```

#### useEffect - Side Effects

**Usage in:** [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)

```tsx
import { useEffect } from "react";

useEffect(() => {
  const verifyUser = async () => {
    if (user) {
      const exists = await checkUserExists(user.id);
      if (!exists) {
        logout();
        navigate("/login", { replace: true });
      }
    }
  };
  void verifyUser();
}, [user, logout, navigate]);
```

#### useMemo - Performance Optimization

**Usage in:** [src/components/tasks/TaskList.tsx](src/components/tasks/TaskList.tsx)

```tsx
import { useMemo } from "react";

const taskCounts = useMemo(
  () => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }),
  [tasks]
);

const filteredTasks = useMemo(
  () =>
    filter === "all" ? tasks : tasks.filter((task) => task.status === filter),
  [tasks, filter]
);
```

### 2. Form Management with React Hook Form

**File:** [src/components/tasks/TaskForm.tsx](src/components/tasks/TaskForm.tsx)

```tsx
import { useForm } from "react-hook-form";

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
}

export const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
        }
      : {
          title: "",
          description: "",
          status: "todo",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title Field */}
      <div>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          {...register("title", {
            required: "Title is required",
            minLength: {
              value: 3,
              message: "Title must be at least 3 characters",
            },
          })}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.title && (
          <p className="text-red-600 text-sm">{errors.title.message}</p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          rows={3}
          {...register("description", {
            required: "Description is required",
            minLength: {
              value: 10,
              message: "Description must be at least 10 characters",
            },
          })}
        />
        {errors.description && (
          <p className="text-red-600 text-sm">{errors.description.message}</p>
        )}
      </div>

      {/* Status Field */}
      <div>
        <label htmlFor="status">Status *</label>
        <select {...register("status", { required: true })}>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit">Save Task</Button>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
};
```

### 3. Protected Routes Pattern

**File:** [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)

```tsx
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  // Verify user exists in database
  useEffect(() => {
    const verifyUser = async () => {
      if (user) {
        try {
          const response = await fetch(
            `http://localhost:3000/users/${user.id}`
          );
          if (!response.ok) {
            logout();
            navigate("/login", { replace: true });
          }
        } catch (error) {
          console.error("Error verifying user:", error);
        }
      }
    };
    void verifyUser();
  }, [user, logout, navigate]);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

---

## API Documentation

### Backend - JSON Server

**Base URL:** `http://localhost:3000`

**Database File:** [src/data/db.json](src/data/db.json)

#### Endpoints

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| GET    | `/users`            | Get all users        |
| GET    | `/users/:id`        | Get user by ID       |
| POST   | `/users`            | Create new user      |
| GET    | `/tasks`            | Get all tasks        |
| GET    | `/tasks?userId=:id` | Get tasks by user ID |
| POST   | `/tasks`            | Create new task      |
| PUT    | `/tasks/:id`        | Update task          |
| PATCH  | `/tasks/:id`        | Partial update task  |
| DELETE | `/tasks/:id`        | Delete task          |

### API Client Layer

#### Authentication API

**File:** [src/api/authApi.ts](src/api/authApi.ts)

```typescript
const API_URL = "http://localhost:3000";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/users?email=${data.email}`);
  const users = await response.json();

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];
  if (user.password !== data.password) {
    throw new Error("Invalid password");
  }

  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword };
};

// Register new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Check if email exists
  const checkResponse = await fetch(`${API_URL}/users?email=${data.email}`);
  const existingUsers = await checkResponse.json();

  if (existingUsers.length > 0) {
    throw new Error("Email already registered");
  }

  // Create new user
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const user = await response.json();
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword };
};
```

#### Task API

**File:** [src/api/taskApiJsonServer.ts](src/api/taskApiJsonServer.ts)

```typescript
const API_URL = "http://localhost:3000";

// Get all tasks for a user
export const getTasks = async (userId: string): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks?userId=${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
};

// Create a new task
export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const payload = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
};

// Update an existing task
export const updateTask = async (
  id: string,
  data: UpdateTaskData
): Promise<Task> => {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  return response.json();
};

// Delete a task
export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
};
```

---

## Component Reference

### Task Components

#### TaskCard

**File:** [src/components/tasks/TaskCard.tsx](src/components/tasks/TaskCard.tsx)

**Purpose:** Display a single task with actions

**Props:**

```typescript
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}
```

**Usage:**

```tsx
<TaskCard task={task} onEdit={handleEdit} onDelete={handleDelete} />
```

#### TaskList

**File:** [src/components/tasks/TaskList.tsx](src/components/tasks/TaskList.tsx)

**Purpose:** Display filtered list of tasks

**Props:**

```typescript
interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}
```

**Features:**

- Filter by status (All, To Do, In Progress, Completed)
- Display task count for each status
- Empty state handling

#### TaskForm

**File:** [src/components/tasks/TaskForm.tsx](src/components/tasks/TaskForm.tsx)

**Purpose:** Create or edit tasks

**Props:**

```typescript
interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}
```

**Validation Rules:**

- Title: Required, min 3 characters
- Description: Required, min 10 characters
- Status: Required (todo | in-progress | completed)

#### Tasks (Container)

**File:** [src/components/tasks/Tasks.tsx](src/components/tasks/Tasks.tsx)

**Purpose:** Main container for task management

**Props:**

```typescript
interface TasksProps {
  userId?: string;
}
```

**Responsibilities:**

- Fetches tasks using `useTasks` hook
- Manages create/edit modal state
- Handles task CRUD operations
- Displays loading and error states

### Common Components

#### Loader

**File:** [src/components/common/Loader.tsx](src/components/common/Loader.tsx)

```tsx
export const Loader = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);
```

#### ErrorMessage

**File:** [src/components/common/ErrorMessage.tsx](src/components/common/ErrorMessage.tsx)

```tsx
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
    <p className="text-red-800">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" className="mt-2">
        Retry
      </Button>
    )}
  </div>
);
```

### UI Components

#### Button

**File:** [src/components/ui/button.tsx](src/components/ui/button.tsx)

**Variants:**

- `default` - Primary blue button
- `destructive` - Red danger button
- `outline` - Outlined button
- `secondary` - Gray button
- `ghost` - Transparent button
- `link` - Link styled button

**Sizes:**

- `default` - Standard size
- `sm` - Small
- `lg` - Large
- `icon` - Icon button

**Usage:**

```tsx
import { Button } from "./components/ui/button";

<Button variant="default" size="lg">
  Click Me
</Button>

<Button variant="destructive" onClick={handleDelete}>
  Delete
</Button>

<Button variant="outline" disabled>
  Disabled
</Button>
```

---

## State Management

### Global State - Zustand

**File:** [src/store/authStore.ts](src/store/authStore.ts)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
```

**Usage:**

```tsx
import { useAuthStore } from "../store/authStore";

function Component() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async () => {
    const userData = await loginApi({ email, password });
    login(userData.user);
  };

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.name}!</p>}
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Server State - TanStack Query

**Setup:** [src/main.tsx](src/main.tsx)

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

---

## Hooks Reference

### useTasks

**File:** [src/hooks/useTasks.ts](src/hooks/useTasks.ts)

**Purpose:** Manage all task-related operations with React Query

**Signature:**

```typescript
export const useTasks = (userId?: string) => {
  // Returns
  return {
    tasks: Task[],
    isLoading: boolean,
    isError: boolean,
    error: Error | null,
    createTask: (data: TaskFormData) => Promise<void>,
    updateTask: (id: string, data: UpdateTaskData) => Promise<void>,
    deleteTask: (id: string) => Promise<void>,
  };
};
```

**Implementation:**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useTasks = (userId?: string) => {
  const queryClient = useQueryClient();

  // Fetch tasks
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery<Task[], Error>({
    queryKey: ["tasks", userId],
    queryFn: () => getTasks(userId!),
    enabled: Boolean(userId),
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => {
      if (!userId) throw new Error("User not found");
      const payload: CreateTaskData = { ...data, userId };
      return createTask(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
    },
  });

  return {
    tasks,
    isLoading,
    isError,
    error,
    createTask: createTaskMutation.mutateAsync,
    updateTask: (id: string, data: UpdateTaskData) =>
      updateTaskMutation.mutateAsync({ id, data }),
    deleteTask: deleteTaskMutation.mutateAsync,
  };
};
```

**Usage:**

```tsx
import { useTasks } from "../hooks/useTasks";

function TasksComponent({ userId }: { userId: string }) {
  const { tasks, isLoading, createTask, updateTask, deleteTask } =
    useTasks(userId);

  const handleCreate = async (data: TaskFormData) => {
    try {
      await createTask(data);
      console.log("Task created!");
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={(task) => updateTask(task.id, task)}
          onDelete={deleteTask}
        />
      ))}
    </div>
  );
}
```

---

## Type Definitions

### Task Types

**File:** [src/types/task.ts](src/types/task.ts)

```typescript
// Task status literal type
export type TaskStatus = "todo" | "in-progress" | "completed";

// Main Task interface
export interface Task {
  id: string;
  userId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Form data type (for React Hook Form)
export type TaskFormData = {
  title: string;
  description: string;
  status: TaskStatus;
};

// Type for creating a new task
export type CreateTaskData = Omit<Task, "id" | "createdAt" | "updatedAt">;

// Type for updating a task (all fields optional)
export type UpdateTaskData = Partial<TaskFormData>;
```

### Usage Examples

```typescript
// Using TaskStatus
const status: TaskStatus = "in-progress";

// Using Task interface
const task: Task = {
  id: "1",
  userId: "user-1",
  title: "Complete documentation",
  description: "Write comprehensive docs",
  status: "in-progress",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Using TaskFormData
const formData: TaskFormData = {
  title: "New task",
  description: "Task description",
  status: "todo",
};

// Using CreateTaskData
const newTask: CreateTaskData = {
  userId: "user-1",
  title: "New task",
  description: "Description",
  status: "todo",
};

// Using UpdateTaskData
const updates: UpdateTaskData = {
  status: "completed",
};
```

---

## Environment Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# JSON Server API URL
VITE_JSON_SERVER_API_URL=http://localhost:3000

# Optional: Port for Vite dev server
VITE_PORT=5173
```

### Using Environment Variables

```typescript
// Access in code
const API_URL =
  import.meta.env.VITE_JSON_SERVER_API_URL || "http://localhost:3000";
```

---

## Deployment

### Vercel Configuration

**File:** [vercel.json](vercel.json)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This ensures client-side routing works correctly in production.

### Build Command

```bash
npm run build
```

Output directory: `dist/`

---

## Key Features

✅ **Authentication**

- User registration with validation
- Login with email/password
- Persistent auth state (localStorage)
- Protected routes with verification

✅ **Task Management**

- Create, read, update, delete tasks
- Filter by status (All, To Do, In Progress, Completed)
- Real-time task counts
- Form validation

✅ **Performance**

- Code splitting with lazy loading
- Memoized computations
- Optimistic UI updates
- Query caching with TanStack Query

✅ **Developer Experience**

- Full TypeScript type safety
- ESLint configuration
- Fast HMR with Vite
- Reusable component library

✅ **UI/UX**

- Responsive design
- Loading states
- Error handling
- Consistent styling with Tailwind CSS

---

## License

MIT License - Feel free to use this project for learning and experimentation!
