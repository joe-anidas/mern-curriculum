interface Repository<T> {
  findById(id: string): T | null;
  save(item: T): void;
}

type User = {
  id: string;
  name: string;
};

class UserRepository implements Repository<User> {
  private users: User[] = [];

  findById(id: string): User | null {
    return this.users.find(u => u.id === id) || null;
  }

  save(user: User): void {
    this.users.push(user);
  }
}

const repo = new UserRepository();
repo.save({ id: "u1", name: "Joe" });
console.log(repo.findById("u1"));
