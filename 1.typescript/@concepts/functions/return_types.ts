function isValidEmail(email: string): boolean {
  return email.includes("@");
}

function calculateTotal(prices: number[]): number {
  return prices.reduce((sum, price) => sum + price, 0);
}

function logMessage(message: string): void {
  console.log(message);
}

console.log(isValidEmail("test@gmail.com"));
console.log(calculateTotal([100, 200, 300]));
logMessage("User created successfully");
