# TaskFlow Frontend

A modern React + TypeScript frontend application for task management, built with Vite, TanStack Query, and Tailwind CSS.

## Tech Stack

- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Router v7** - Routing
- **React Hook Form** - Form handling
- **Tailwind CSS v4** - Styling
- **Radix UI** - Headless UI components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_API_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/          # React components
│   ├── common/          # Shared components (ErrorBoundary, Loader, etc.)
│   ├── features/        # Feature-specific components
│   │   ├── auth/        # Authentication components
│   │   └── tasks/       # Task management components
│   └── ui/              # Base UI components (shadcn/ui)
├── config/              # Configuration files
│   └── api.ts           # API endpoints and base URL
├── constants/           # Application constants
├── hooks/               # Custom React hooks
│   └── useTasks.ts      # Task management hook
├── lib/                 # Utility libraries
│   ├── httpClient.ts    # HTTP client wrapper
│   └── utils.ts         # Utility functions
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── TasksPage.tsx
├── services/            # API service layer
│   └── api/             # API service modules
│       ├── authService.ts
│       └── taskService.ts
├── store/               # State management
│   └── authStore.ts     # Authentication store (Zustand)
├── types/               # TypeScript type definitions
├── App.tsx              # Root component
└── main.tsx             # Application entry point
```

## Key Features

### Authentication

- User registration and login
- JWT token-based authentication
- Protected routes
- Persistent authentication state using Zustand

### Task Management

- Create, read, update, and delete tasks
- Task status management (PENDING, IN_PROGRESS, COMPLETED)
- Optimistic UI updates
- Server state synchronization with TanStack Query

### UI/UX

- Responsive design with Tailwind CSS
- Loading states and error boundaries
- Lazy-loaded routes for better performance
- Accessible components with Radix UI

## Architecture Patterns

### State Management

- **Server State**: TanStack Query for data fetching, caching, and synchronization
- **Client State**: Zustand for authentication state with persistence
- **Form State**: React Hook Form for form handling and validation

### Code Organization

- **Feature-based structure**: Components organized by feature (auth, tasks)
- **Service layer**: Separated API logic from components
- **Custom hooks**: Reusable logic extracted into hooks
- **Type safety**: Comprehensive TypeScript types and interfaces

### Performance Optimizations

- Lazy-loaded routes with React.lazy and Suspense
- CSS code splitting disabled for better initial load
- Terser minification with console removal
- Path aliases (`@/`) for cleaner imports

## API Integration

The frontend communicates with the backend REST API defined in `src/config/api.ts`.

### Main Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### HTTP Client

The application uses a custom HTTP client (`src/lib/httpClient.ts`) that:

- Automatically attaches JWT tokens to requests
- Handles authentication errors
- Provides consistent error handling

## Routes

- `/` - Redirects to login
- `/login` - Login page
- `/register` - Registration page
- `/tasks` - Protected tasks dashboard
- `*` - Catches all undefined routes, redirects to login

## Component Guidelines

### Error Handling

All routes are wrapped in an `ErrorBoundary` component that catches and displays errors gracefully.

### Loading States

- Lazy-loaded components show a `Loader` component during loading
- TanStack Query provides loading states for data fetching

### Protected Routes

The `ProtectedRoute` component ensures users are authenticated before accessing protected pages.

## Deployment

The project includes Vercel configuration (`vercel.json`). To deploy:

```bash
npm run build
```

Then deploy the `dist` folder to your hosting provider.

## Development Tools

- **ESLint** - Code linting with React-specific rules
- **TypeScript** - Static type checking
- **Vite** - Fast development server with HMR

## Browser Support

Targets modern browsers with ES2020+ support.

## Contributing

1. Follow the established folder structure
2. Use TypeScript for all new files
3. Follow React best practices and hooks rules
4. Run linting before committing
5. Keep components small and focused
6. Write descriptive type definitions

## License

See main project LICENSE file.
