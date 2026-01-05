interface User {
  id: string;
  name: string;
  email: string;
}

type ReadonlyUser = Readonly<User>;

const user: ReadonlyUser = {
  id: "u1",
  name: "Joe",
  email: "joe@gmail.com"
};
