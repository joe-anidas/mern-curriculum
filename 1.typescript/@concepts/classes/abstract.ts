abstract class Payment {
  abstract pay(amount: number): boolean;

  log(amount: number): void {
    console.log(`Payment attempted: ${amount}`);
  }
}

class UPIPayment extends Payment {
  pay(amount: number): boolean {
    this.log(amount);
    return true;
  }
}

const payment = new UPIPayment();
console.log(payment.pay(1000));
