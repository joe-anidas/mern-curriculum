import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Sample() {
  const [url, seturl] = useState(
    "https://api.github.com/repos/joe-anidas/anti-fake"
  );

  function apiCall({ queryKey }: { queryKey: string[] }) {
    const url = queryKey[1];
    return fetch(url).then(res => res.json());
  }

  const repo1 = useQuery({
    queryKey: ["repo1", url],
    queryFn: apiCall,
  });

  const repo2 = useQuery({
    queryKey: ["repo2", "https://api.github.com/repos/joe-anidas/hybrid-ats"],
    queryFn: apiCall,
  });

  if (repo1.isPending || repo2.isPending) {
    return <div>Loading...</div>;
  }

  if (repo1.error || repo2.error) {
    return <div>Error occurred</div>;
  }

  return (
    <>
      <h1>Repo1 name: {repo1.data?.name}</h1>
      <h1>Repo1 language: {repo1.data?.language}</h1>

      <h1>Repo2 name: {repo2.data?.name}</h1>
      <h1>Repo2 language: {repo2.data?.language}</h1>

      <button onClick={() =>
        seturl("https://api.github.com/repos/joe-anidas/flair2k25")
      }>
        Change Repo1
      </button>
    </>
  );
}
