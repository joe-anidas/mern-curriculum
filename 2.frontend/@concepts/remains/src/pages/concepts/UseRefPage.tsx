import { useRef, useState } from "react";
import ConceptTemplate from "../../components/ConceptTemplate";

function RefExample() {
  const inputRef = useRef<HTMLInputElement>(null);
  const renderCount = useRef(0);
  const [text, setText] = useState("");

  renderCount.current++;

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setText("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          padding: "12px",
          backgroundColor: "#374151",
          borderRadius: "4px",
        }}
      >
        <p style={{ color: "#60a5fa", marginBottom: "8px" }}>
          Render Count: {renderCount.current}
        </p>
        <p style={{ color: "#86efac", fontSize: "12px" }}>
          (Notice: Render count increases on every re-render, but ref persists)
        </p>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
        style={{
          padding: "8px 12px",
          backgroundColor: "#1f2937",
          color: "#fff",
          border: "1px solid #4b5563",
          borderRadius: "4px",
          fontFamily: "monospace",
        }}
      />

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleFocus}
          style={{
            flex: 1,
            padding: "8px 12px",
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Focus Input
        </button>
        <button
          onClick={handleClear}
          style={{
            flex: 1,
            padding: "8px 12px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

const code = `import { useRef, useState } from 'react'

function RefExample() {
  const inputRef = useRef(null)
  const renderCount = useRef(0)
  const [text, setText] = useState('')

  // Increments every render
  renderCount.current++

  const handleFocus = () => {
    // Access DOM directly without re-render
    inputRef.current?.focus()
  }

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      setText('')
    }
  }

  return (
    <div>
      <p>Render Count: {renderCount.current}</p>
      
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      <button onClick={handleFocus}>Focus Input</button>
      <button onClick={handleClear}>Clear</button>
    </div>
  )
}`;

export default function UseRefPage() {
  return (
    <ConceptTemplate
      title="useRef"
      description="Persist mutable values across renders without causing re-renders"
      code={code}
      output={<RefExample />}
      explanation="useRef returns a mutable ref object whose .current property is initialized to the passed argument. Unlike useState, updating a ref does not trigger a re-render. Refs are commonly used to access DOM elements directly (focusing input, playing video, etc.) or to keep track of mutable values that don't affect the render output."
      useCases={[
        "Managing focus on input fields or buttons",
        "Triggering animations or media playback",
        "Tracking previous props or state values",
        "Storing timers/intervals to clear them later",
        "Integrating with third-party DOM libraries",
      ]}
      bestPractices={[
        "Use refs as an escape hatch, not the default solution",
        "Prefer state (useState) for values that affect rendering",
        "Type refs properly: useRef<HTMLInputElement>(null)",
        "Always check if ref.current exists before accessing it",
        "Clean up refs that store resources (timers, subscriptions)",
      ]}
      commonMistakes={[
        "Using refs instead of state for data that should trigger re-renders",
        "Trying to access ref.current in JSX directly (returns mutable object)",
        "Not initializing ref with null or proper initial value",
        "Forgetting to attach ref to DOM element (ref={inputRef})",
        "Using refs in useEffect without proper dependency array",
      ]}
      accentColor="bg-purple-50 border-purple-200"
      bgColor="bg-purple-900"
    />
  );
}
