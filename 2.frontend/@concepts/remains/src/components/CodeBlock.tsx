import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
}

export default function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Code</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded transition-colors text-sm font-medium"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 border border-gray-800 rounded-lg p-6 overflow-x-auto">
        <code className="text-gray-100 font-mono text-sm leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
}
