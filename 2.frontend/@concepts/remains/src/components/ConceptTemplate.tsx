import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CodeBlock from "./CodeBlock";
import OutputBlock from "./OutputBlock";

interface ConceptTemplateProps {
  title: string;
  description: string;
  code: string;
  output: string | React.ReactNode;
  explanation: string;
  useCases?: string[];
  bestPractices?: string[];
  commonMistakes?: string[];
}

export default function ConceptTemplate({
  title,
  description,
  useCases = [],
  bestPractices = [],
  commonMistakes = [],
  code,
  output,
  explanation,
}: ConceptTemplateProps) {
  const navigate = useNavigate();

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Concepts
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{description}</p>
          </div>
        </div>
      </header>

      <main className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Explanation */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              What is it?
            </h2>
            <p className="text-gray-700 leading-relaxed">{explanation}</p>
          </div>

          {/* Code and Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <CodeBlock code={code} />
            <OutputBlock output={output} />
          </div>

          {/* Use Cases */}
          {useCases.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Real-World Use Cases
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {useCases.map((useCase, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <p className="text-gray-700">{useCase}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Practices */}
          {bestPractices.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ✅ Best Practices
              </h2>
              <div className="space-y-3">
                {bestPractices.map((practice, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <span className="text-green-700 font-bold flex-shrink-0">
                      ✓
                    </span>
                    <p className="text-gray-700">{practice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {commonMistakes.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ⚠️ Common Mistakes
              </h2>
              <div className="space-y-3">
                {commonMistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-4"
                  >
                    <span className="text-red-700 font-bold flex-shrink-0">
                      ✗
                    </span>
                    <p className="text-gray-700">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
