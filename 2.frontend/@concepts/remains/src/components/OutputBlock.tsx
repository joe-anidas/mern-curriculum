interface OutputBlockProps {
  output: string | React.ReactNode;
}

export default function OutputBlock({ output }: OutputBlockProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Output</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 min-h-64 font-mono text-sm text-gray-100">
        {typeof output === "string" ? (
          <pre className="whitespace-pre-wrap break-words">{output}</pre>
        ) : (
          output
        )}
      </div>
    </div>
  );
}
