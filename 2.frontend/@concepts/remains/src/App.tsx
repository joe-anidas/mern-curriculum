import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConceptsPage from "./pages/ConceptsPage.tsx";
import UseContextPage from "./pages/concepts/UseContextPage.tsx";
import UseRefPage from "./pages/concepts/UseRefPage.tsx";
import IntersectionTypesPage from "./pages/concepts/IntersectionTypesPage.tsx";
import FunctionOverloadsPage from "./pages/concepts/FunctionOverloadsPage.tsx";
import EnumsPage from "./pages/concepts/EnumsPage.tsx";
import NamespacesPage from "./pages/concepts/NamespacesPage.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConceptsPage />} />
        <Route path="/usecontext" element={<UseContextPage />} />
        <Route path="/useref" element={<UseRefPage />} />
        <Route path="/intersection-types" element={<IntersectionTypesPage />} />
        <Route path="/function-overloads" element={<FunctionOverloadsPage />} />
        <Route path="/enums" element={<EnumsPage />} />
        <Route path="/namespaces" element={<NamespacesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
