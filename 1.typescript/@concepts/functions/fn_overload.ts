type User = {
  id: string;
  name: string;
};

function getUser(id: string): User;
function getUser(id: number): User;

function getUser(id: string | number): User {
  if (typeof id === "string") {
    return { id, name: "User from MongoDB" };
  }
  return { id: id.toString(), name: "User from Local DB" };
}

console.log(getUser("64abc"));
console.log(getUser(1));
