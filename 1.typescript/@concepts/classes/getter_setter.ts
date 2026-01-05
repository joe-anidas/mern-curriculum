class Account {
  private balance: number = 0;

  get currentBalance(): number {
    return this.balance;
  }

  set deposit(amount: number) {
    if (amount > 0) {
      this.balance += amount;
    }
  }
}

const account = new Account();
account.deposit = 5000;
console.log(account.currentBalance);
