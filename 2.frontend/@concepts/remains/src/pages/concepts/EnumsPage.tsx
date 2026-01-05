import ConceptTemplate from "../../components/ConceptTemplate";

const code = `// Numeric Enum (default)
enum Status {
  Pending = 0,
  Active = 1,
  Completed = 2
}

// String Enum
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}

// Heterogeneous Enum
enum Mixed {
  Yes = 1,
  No = "NO"
}

// Usage
function processOrder(status: Status) {
  if (status === Status.Active) {
    return "Order is being processed"
  } else if (status === Status.Completed) {
    return "Order completed"
  }
  return "Pending..."
}

console.log(processOrder(Status.Active))
// Output: Order is being processed

console.log(Color.Red)    // Output: RED
console.log(Mixed.Yes)    // Output: 1`;

export default function EnumsPage() {
  return (
    <ConceptTemplate
      title="Enums"
      description="Define a set of named constants"
      code={code}
      output={
        <div style={{ color: "#86efac" }}>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ color: "#60a5fa", marginBottom: "4px" }}>
              Numeric Enum:
            </p>
            <p style={{ fontSize: "12px" }}>
              Status.Pending = 0, Status.Active = 1, Status.Completed = 2
            </p>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ color: "#60a5fa", marginBottom: "4px" }}>
              String Enum:
            </p>
            <p style={{ fontSize: "12px" }}>
              Color.Red = "RED", Color.Green = "GREEN"
            </p>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ color: "#60a5fa", marginBottom: "4px" }}>
              Function Result:
            </p>
            <p>Order is being processed</p>
          </div>
        </div>
      }
      explanation="Enums allow you to define a set of named constants, either numeric or string-based. Numeric enums auto-increment by default, while string enums require explicit values. Enums provide several benefits: better code readability, type safety, and IDE autocomplete. They're useful for representing fixed sets of values like status codes, color options, or direction constants."
      useCases={[
        "API response status codes (pending, success, error)",
        "User roles (admin, user, guest, moderator)",
        "Direction constants (up, down, left, right)",
        "Feature flags or configuration options",
      ]}
      bestPractices={[
        "Use string enums for readability and debugging",
        "Prefer const enums for performance when possible",
        "Export enums from a dedicated types file",
        "Use PascalCase for enum names",
        "Group related enums by functionality",
      ]}
      commonMistakes={[
        "Using numeric enums when string enums would be clearer",
        "Mixing numeric and string values in the same enum",
        "Creating enums for values that might change frequently",
        "Not exporting enums, making them hard to find",
        "Using magic numbers/strings instead of enums",
      ]}
      accentColor="bg-indigo-50 border-indigo-200"
      bgColor="bg-indigo-900"
    />
  );
}
