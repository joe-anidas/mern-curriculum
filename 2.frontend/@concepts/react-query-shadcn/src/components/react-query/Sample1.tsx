import { useQuery } from "@tanstack/react-query";

export default function Sample() {
  function apiCall() {
    return fetch("https://api.github.com/repos/joe-anidas/anti-fake").then(
      (response) => response.json()
    );
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["githubData"],
    queryFn: apiCall,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error occurred</div>;
  }

  console.log(data);

  return (
    <>
      <h1>Repo name: {data?.name}</h1>
      <h1>Repo language: {data?.language}</h1>
    </>
  );
}
