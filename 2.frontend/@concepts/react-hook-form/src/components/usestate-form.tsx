import { useState } from "react";

function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: Record<string, any>) : void => {
    e.preventDefault();

    if (!password) {
      setError("Password is required");
      return;
    }

    console.log({

      email,
      password,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
   

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p>{error}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}

export default App;
