class UserService {
  getRole(): string {
    return "user";
  }
}

class AdminService extends UserService {
  getRole(): string {
    return "admin";
  }
}

const userService = new UserService();
const adminService = new AdminService();

console.log(userService.getRole());
console.log(adminService.getRole());
