import { createContext, useContext, useState } from "react";
import ConceptTemplate from "../../components/ConceptTemplate";

// Create a Theme Context
const ThemeContext = createContext<
  { theme: string; toggleTheme: () => void } | undefined
>(undefined);

// Provider Component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Component using useContext
function ThemeDisplay() {
  const context = useContext(ThemeContext);

  if (!context) {
    return <div>No context available</div>;
  }

  const { theme, toggleTheme } = context;

  return (
    <div
      style={{
        backgroundColor: theme === "light" ? "#fff" : "#1f2937",
        color: theme === "light" ? "#000" : "#fff",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "12px",
      }}
    >
      <p>
        Current Theme: <strong>{theme.toUpperCase()}</strong>
      </p>
      <button
        onClick={toggleTheme}
        style={{
          backgroundColor: theme === "light" ? "#000" : "#fff",
          color: theme === "light" ? "#fff" : "#000",
          padding: "8px 16px",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
          marginTop: "8px",
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
}

const code = `import { createContext, useContext, useState } from 'react'

// 1. Create context
const ThemeContext = createContext<{ theme: string; toggleTheme: () => void } | undefined>(
  undefined
)

// 2. Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 3. Use context in component
function ThemeDisplay() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  
  return (
    <div>
      <p>Current Theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

// 4. Wrap app
<ThemeProvider>
  <ThemeDisplay />
</ThemeProvider>`;

export default function UseContextPage() {
  return (
    <ConceptTemplate
      title="useContext"
      description="Consume context values without prop drilling"
      code={code}
      output={
        <ThemeProvider>
          <ThemeDisplay />
        </ThemeProvider>
      }
      explanation="useContext is a React hook that lets you subscribe to context without wrapping your component in a Consumer component. It takes a context object (created with React.createContext) and returns the current context value. This eliminates the need to pass props down through many levels of components - a pattern called 'prop drilling'."
      useCases={[
        "Managing theme (dark/light mode) globally",
        "Storing user authentication state",
        "Managing language/localization preferences",
        "Sharing UI state (modals, notifications) across components",
      ]}
      bestPractices={[
        "Create custom hooks to wrap useContext for easier access",
        "Split contexts by concern (Theme, Auth, UI state, etc.)",
        "Memoize context values to prevent unnecessary re-renders",
        "Use TypeScript interfaces for type-safe context values",
      ]}
      commonMistakes={[
        "Using context for frequently changing data (use Redux/Zustand instead)",
        "Creating a single massive context for everything",
        "Not wrapping consumer components with the provider",
        "Forgetting to check if context is undefined before using it",
      ]}
    />
  );
}
