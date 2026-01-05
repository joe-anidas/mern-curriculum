import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "./App.css";
import ReactQuery from "./components/react-query/Sample4";
import Shadcn from "./components/shadcn/Sample1";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQuery />
      <hr/>
      <Shadcn/>
    </QueryClientProvider>
  );
}

export default App;
