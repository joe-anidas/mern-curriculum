type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

function successResponse<T>(data: T, message: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

const userResponse = successResponse(
  { id: "u1", name: "Joe" },
  "User fetched"
);

const productResponse = successResponse(
  [{ id: "p1", title: "Laptop" }],
  "Products list"
);

console.log(userResponse);
console.log(productResponse);
