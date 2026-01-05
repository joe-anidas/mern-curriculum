import { useQuery } from "@tanstack/react-query";

export default function Sample() {
  function apiCall({queryKey}: {queryKey: string[]}) {
    return fetch(queryKey[1]).then((response) => response.json());
  }

  const repo1 = useQuery({
    queryKey: [
      "githubData",
      "https://api.github.com/repos/joe-anidas/anti-fake",
    ],
    queryFn: apiCall,
  });

  const repo2 = useQuery({
    queryKey: ["githubData","https://api.github.com/repos/joe-anidas/hybrid-ats"],
    queryFn: apiCall,
  });

  if (repo1.isLoading || repo2.isLoading) {
    return <div>Loading...</div>;
  }

  if (repo1.error || repo2.error) {
    return <div>Error occurred</div>;
  }

  console.log(repo1.data);
  console.log(repo2.data);

  return (
    <>
      <h1>Repo1 name: {repo1.data?.name}</h1>
      <h1>Repo1 language: {repo1.data?.language}</h1>

      <h1>Repo2 name: {repo2.data?.name}</h1>
      <h1>Repo2 language: {repo2.data?.language}</h1>
    </>
  );
}
