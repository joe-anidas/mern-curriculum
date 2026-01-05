class BaseUser {
  protected id: string;
  protected name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  getProfile(): string {
    return `${this.id} - ${this.name}`;
  }
}

class Admin extends BaseUser {
  role: string = "admin";

  constructor(id: string, name: string) {
    super(id, name);
  }

  getAdminInfo(): string {
    return `${this.getProfile()} - ${this.role}`;
  }
}

const admin = new Admin("a1", "Admin User");
console.log(admin.getAdminInfo());
