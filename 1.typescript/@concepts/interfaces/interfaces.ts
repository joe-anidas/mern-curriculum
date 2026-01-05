interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

function printUser(user: User): void {
  console.log(user.name, user.email, user.isActive);
}

const user: User = {
  id: "u101",
  name: "Joe",
  email: "joe@gmail.com",
  isActive: true
};

printUser(user);
