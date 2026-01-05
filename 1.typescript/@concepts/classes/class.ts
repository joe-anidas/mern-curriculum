class User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }
}

const user = new User("u1", "Joe", "joe@gmail.com");
user.deactivate();
console.log(user);
