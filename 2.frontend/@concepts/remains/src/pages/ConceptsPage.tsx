import { useNavigate } from "react-router-dom";
import ConceptCard from "../components/ConceptCard";

interface Concept {
  id: string;
  title: string;
  description: string;
  path: string;
  color: string;
}

const concepts: Concept[] = [
  {
    id: "usecontext",
    title: "useContext",
    description:
      "React hook for consuming context values without prop drilling",
    path: "/usecontext",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "useref",
    title: "useRef",
    description:
      "React hook to persist mutable values across renders without causing re-renders",
    path: "/useref",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "intersection-types",
    title: "Intersection Types (&)",
    description:
      "TypeScript feature to combine multiple types into a single type",
    path: "/intersection-types",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "function-overloads",
    title: "Function Overloads",
    description:
      "TypeScript feature to define multiple signatures for the same function",
    path: "/function-overloads",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "enums",
    title: "Enums",
    description: "TypeScript feature to define a set of named constants",
    path: "/enums",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: "namespaces",
    title: "Namespaces",
    description: "TypeScript feature to organize code into logical groups",
    path: "/namespaces",
    color: "from-teal-500 to-cyan-500",
  },
];

export default function ConceptsPage() {
  const navigate = useNavigate();

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Learn TypeScript & React
            </h1>
            <p className="text-gray-600 mt-2">
              Master essential concepts with interactive examples
            </p>
          </div>
        </div>
      </header>

      <main className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                onClick={() => navigate(concept.path)}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
