type Product = {
  id: string;
  title: string;
  price: number;
  inStock: boolean;
};

const products: Product[] = [
  { id: "p1", title: "Laptop", price: 55000, inStock: true },
  { id: "p2", title: "Mouse", price: 500, inStock: true },
  { id: "p3", title: "Keyboard", price: 1500, inStock: false }
];

function getAvailableProducts(items: Product[]): Product[] {
  return items.filter(item => item.inStock);
}

function calculateTotal(items: Product[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

const availableProducts = getAvailableProducts(products);
const totalPrice = calculateTotal(availableProducts);

console.log(availableProducts);
console.log("Total:", totalPrice);
