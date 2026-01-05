import ConceptTemplate from "../../components/ConceptTemplate";

const code = `// Define individual types
type User = {
  id: number
  name: string
}

type Admin = {
  adminLevel: number
  permissions: string[]
}

// Combine them using intersection (&)
type AdminUser = User & Admin

// The resulting type has all properties
const adminUser: AdminUser = {
  id: 1,
  name: "John",
  adminLevel: 5,
  permissions: ["read", "write", "delete"]
}

// Use case: Function that requires both interfaces
function getAdminInfo(user: AdminUser) {
  return \`\${user.name} is level \${user.adminLevel} admin\`
}

console.log(getAdminInfo(adminUser))
// Output: John is level 5 admin`;

export default function IntersectionTypesPage() {
  return (
    <ConceptTemplate
      title="Intersection Types (&)"
      description="Combine multiple types into one"
      code={code}
      output={
        <div style={{ color: "#86efac" }}>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ color: "#60a5fa", marginBottom: "4px" }}>
              Admin User Object:
            </p>
            <pre
              style={{
                backgroundColor: "#111827",
                padding: "8px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {`{
  id: 1,
  name: "John",
  adminLevel: 5,
  permissions: ["read", "write", "delete"]
}`}
            </pre>
          </div>
          <div>
            <p style={{ color: "#60a5fa", marginBottom: "4px" }}>
              Function Result:
            </p>
            <p>John is level 5 admin</p>
          </div>
        </div>
      }
      explanation="Intersection types allow you to combine multiple types into a single type using the & operator. The resulting type will have all properties from each type combined. Unlike Union types (|), intersection types require ALL properties from all types."
      useCases={[
        "Combining user roles (User & Admin)",
        "Extending component props with common properties",
        "Creating middleware types that require multiple interfaces",
        "Building plugins that must satisfy multiple contracts",
      ]}
      bestPractices={[
        "Use intersection types for tight requirements, not loose combinations",
        "Consider using union types (|) for flexible alternatives",
        "Document why types are combined for future maintainers",
        "Keep intersection types readable (max 3-4 types)",
        "Extract complex intersections into named type aliases",
      ]}
      commonMistakes={[
        "Confusing & (AND - all properties required) with | (OR - one property required)",
        "Creating intersections with conflicting property types",
        "Overusing intersections when composition would be clearer",
        "Forgetting that intersections require ALL properties from ALL types",
        "Not testing that intersection types work as expected",
      ]}
      accentColor="bg-amber-50 border-amber-200"
      bgColor="bg-amber-900"
    />
  );
}
