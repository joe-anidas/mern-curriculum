class SecureUser {
  public id: string;
  public name: string;
  private password: string;

  constructor(id: string, name: string, password: string) {
    this.id = id;
    this.name = name;
    this.password = password;
  }

  validatePassword(input: string): boolean {
    return this.password === input;
  }
}

const user = new SecureUser("u2", "Joe", "secret");
console.log(user.validatePassword("secret"));
