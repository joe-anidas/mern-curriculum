type User = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

function createUser(
  name: string,
  email: string,
  isActive: boolean
): User {
  return {
    id: crypto.randomUUID(),
    name,
    email,
    isActive
  };
}

const user = createUser("Joe", "joe@gmail.com", true);
console.log(user);
