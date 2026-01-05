import ConceptTemplate from "../../components/ConceptTemplate";

const code = `// Namespace for UI utilities
namespace UIUtils {
  export const colors = {
    primary: "#3b82f6",
    secondary: "#10b981",
    danger: "#ef4444"
  }

  export function formatLabel(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  export const Button = {
    create: () => "<button>Click me</button>"
  }
}

// Namespace for API utilities
namespace APIUtils {
  export const baseURL = "https://api.example.com"

  export function getEndpoint(path: string) {
    return \`\${baseURL}/\${path}\`
  }
}

// Usage - Namespaces prevent name conflicts
console.log(UIUtils.formatLabel("hello"))
// Output: Hello

console.log(UIUtils.colors.primary)
// Output: #3b82f6

console.log(APIUtils.getEndpoint("users"))
// Output: https://api.example.com/users`;

export default function NamespacesPage() {
  return (
    <ConceptTemplate
      title="Namespaces"
      description="Organize code into logical groups and avoid naming conflicts"
      code={code}
      output={
        <div style={{ color: "#86efac" }}>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ color: "#60a5fa", marginBottom: "4px" }}>
              UIUtils Namespace:
            </p>
            <pre
              style={{
                backgroundColor: "#111827",
                padding: "8px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {`colors: {
  primary: "#3b82f6",
  secondary: "#10b981"
}
formatLabel("hello") → "Hello"`}
            </pre>
          </div>
          <div>
            <p style={{ color: "#60a5fa", marginBottom: "4px" }}>
              APIUtils Namespace:
            </p>
            <pre
              style={{
                backgroundColor: "#111827",
                padding: "8px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {`baseURL: "https://api.example.com"
getEndpoint("users") → 
"https://api.example.com/users"`}
            </pre>
          </div>
        </div>
      }
      explanation="Namespaces are containers for related code that help prevent naming conflicts and organize code into logical modules. All code within a namespace is scoped to that namespace. While ES6 modules are now the modern standard, namespaces are still useful for organizing related functions, constants, and types. They're particularly helpful in large codebases or when dealing with multiple related utilities."
      useCases={[
        "Organizing utility functions and constants",
        "Preventing naming conflicts in large projects",
        "Creating organizational structure for third-party libraries",
        "Grouping related types and interfaces",
      ]}
      bestPractices={[
        "Use ES6 modules instead of namespaces in modern projects",
        "Name namespaces with PascalCase (e.g., UIUtils, APIUtils)",
        "Keep namespaces focused on a single responsibility",
        "Export namespaces for external use",
        "Avoid deeply nested namespace structures",
      ]}
      commonMistakes={[
        "Using namespaces instead of ES6 modules in new code",
        "Creating namespaces that are too broad or unfocused",
        "Nesting namespaces too deeply (hard to navigate)",
        "Mixing internal and external exports in the same namespace",
        "Not documenting what each namespace contains",
      ]}
      accentColor="bg-teal-50 border-teal-200"
      bgColor="bg-teal-900"
    />
  );
}
