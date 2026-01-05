type OrderBase = {
  orderId: string;
  createdAt: Date;
};

type PaymentInfo = {
  paymentMethod: "COD" | "CARD" | "UPI";
  isPaid: boolean;
};

type Order = OrderBase & PaymentInfo & {
  totalAmount: number;
};

function createOrder(order: Order): Order {
  return order;
}

const order: Order = {
  orderId: "ORD1001",
  createdAt: new Date(),
  paymentMethod: "UPI",
  isPaid: true,
  totalAmount: 55500
};

const savedOrder = createOrder(order);
console.log(savedOrder);
