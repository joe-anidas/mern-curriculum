enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED"
}

type Order = {
  id: string;
  status: OrderStatus;
};

function updateStatus(order: Order, status: OrderStatus): Order {
  return { ...order, status };
}

const order: Order = {
  id: "ORD101",
  status: OrderStatus.PENDING
};

const updatedOrder = updateStatus(order, OrderStatus.PAID);
console.log(updatedOrder);
