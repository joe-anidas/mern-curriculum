import { ChevronRight } from "lucide-react";

interface ConceptCardProps {
  concept: {
    title: string;
    description: string;
    color: string;
  };
  onClick: () => void;
}

export default function ConceptCard({ concept, onClick }: ConceptCardProps) {
  return (
    <button
      onClick={onClick}
      className="group text-left h-full transition-all duration-300 hover:shadow-lg"
    >
      <div className="bg-white border border-gray-200 rounded-lg p-6 h-full hover:border-gray-400 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
            {concept.title}
          </h3>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {concept.description}
        </p>
      </div>
    </button>
  );
}
