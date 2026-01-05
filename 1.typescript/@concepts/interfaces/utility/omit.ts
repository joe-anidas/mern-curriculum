interface User {
  id: string;
  name: string;
  email: string;
}
type UserWithoutEmail = Omit<User, "email">;

const safeUser: UserWithoutEmail = {
  id: "u1",
  name: "Joe"
};

console.log(safeUser);
