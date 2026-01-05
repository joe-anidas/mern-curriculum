import ConceptTemplate from "../../components/ConceptTemplate";

const code = `// Define multiple function signatures (overloads)
function format(value: string): string
function format(value: number): string
function format(value: boolean): string

// Implementation that handles all cases
function format(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return \`String: "\${value}"\`
  } else if (typeof value === 'number') {
    return \`Number: \${value.toFixed(2)}\`
  } else {
    return \`Boolean: \${value ? 'true' : 'false'}\`
  }
}

// Usage - TypeScript knows exact return type
console.log(format("hello"))      // String: "hello"
console.log(format(42.456))       // Number: 42.46
console.log(format(true))         // Boolean: true

// This would be a compile error:
// format({})  // Error: no overload matches`;

export default function FunctionOverloadsPage() {
  return (
    <ConceptTemplate
      title="Function Overloads"
      description="Define multiple signatures for the same function"
      code={code}
      output={
        <div style={{ color: "#86efac" }}>
          <p style={{ marginBottom: "8px" }}>String: "hello"</p>
          <p style={{ marginBottom: "8px" }}>Number: 42.46</p>
          <p style={{ marginBottom: "12px" }}>Boolean: true</p>
          <div
            style={{
              padding: "8px",
              backgroundColor: "#374151",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#fca5a5",
            }}
          >
            <p>TypeScript catches invalid calls at compile time!</p>
          </div>
        </div>
      }
      explanation="Function overloads allow you to define multiple signatures for the same function name, each with different parameter and return types. You provide the overload signatures first, then a single implementation that handles all cases. TypeScript uses these signatures to provide accurate type checking and IntelliSense, catching errors at compile-time rather than runtime."
      useCases={[
        "API methods accepting different parameter types",
        "Utility functions with flexible parameter handling",
        "Component props that vary based on different modes",
        "Creating flexible libraries with predictable typing",
      ]}
      bestPractices={[
        "Order overloads from most specific to most general",
        "Keep overload signatures separate from implementation",
        "Document each overload signature with JSDoc comments",
        "Test all overload paths in your implementation",
        "Use discriminated unions when overloads get complex",
      ]}
      commonMistakes={[
        "Forgetting to provide an implementation after overload signatures",
        "Implementing the return type differently than promised in overloads",
        "Creating too many overloads (5+) instead of using generics",
        "Not testing all overload branches in the implementation",
        "Placing implementation signature in wrong order",
      ]}
      accentColor="bg-green-50 border-green-200"
      bgColor="bg-green-900"
    />
  );
}
