type ID = string | number;

type Product = {
  id: ID;
  title: string;
  price: number;
};

type GetProductFn = (id: ID) => Product | null;

const getProduct: GetProductFn = (id) => {
  if (id === "p1") {
    return { id, title: "Laptop", price: 55000 };
  }
  return null;
};

console.log(getProduct("p1"));
