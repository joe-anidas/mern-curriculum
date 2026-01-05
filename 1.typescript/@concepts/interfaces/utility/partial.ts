interface User {
  id: string;
  name: string;
  email: string;
}

function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}

const user: User = {
  id: "u1",
  name: "Joe",
  email: "joe@gmail.com"
};

const updatedUser = updateUser(user, { name: "Joe Anidas" });
console.log(updatedUser);
