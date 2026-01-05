type Address = {
  street: string;
  city: string;
  pincode: number;
};

type User = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  address?: Address;
};

function printUser(user: User): void {
  console.log("Name:", user.name);
  console.log("Email:", user.email);
  console.log("Active:", user.isActive);

  if (user.address) {
    console.log("City:", user.address.city);
  }
}

const user: User = {
  id: "u101",
  name: "Joe",
  email: "joe@gmail.com",
  isActive: true,
  address: {
    street: "MG Road",
    city: "Chennai",
    pincode: 600001
  }
};

printUser(user);
