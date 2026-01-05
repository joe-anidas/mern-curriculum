interface User {
  id: string;
  name: string;
  email: string;
}

type UserPreview = Pick<User, "id" | "name">;

const preview: UserPreview = {
  id: "u1",
  name: "Joe"
};

console.log(preview);
