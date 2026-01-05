type ID = string | number;
type UserRole = "user" | "admin";

type User = {
  id: ID;
  name: string;
  role: UserRole;
};

function getDashboardRoute(role: UserRole): string {
  if (role === "admin") {
    return "/admin/dashboard";
  }
  return "/user/home";
}

const user1: User = {
  id: "64abc123",
  name: "Joe",
  role: "user"
};

const user2: User = {
  id: 1,
  name: "Admin",
  role: "admin"
};

console.log(getDashboardRoute(user1.role));
console.log(getDashboardRoute(user2.role));
