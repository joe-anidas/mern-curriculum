export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

const API_BASE_URL = import.meta.env.VITE_JSON_SERVER_API_URL;

const getUserByEmail = async (
  email: string
): Promise<StoredUser | undefined> => {
  const response = await fetch(
    `${API_BASE_URL}/users?email=${encodeURIComponent(email)}`
  );

  if (!response.ok) {
    throw new Error("Failed to check user");
  }

  const users = (await response.json()) as StoredUser[];
  return users[0];
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  if (!data.email || !data.password) {
    throw new Error("Email and password are required");
  }

  const existingUser = await getUserByEmail(data.email);

  if (!existingUser) {
    throw new Error("User not found. Please register first.");
  }

  if (existingUser.password !== data.password) {
    throw new Error("Invalid password");
  }

  return {
    message: "Login successful",
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    },
  };
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  if (!data.name || !data.email || !data.password) {
    throw new Error("All fields are required");
  }

  if (data.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const existingUser = await getUserByEmail(data.email);

  if (existingUser) {
    throw new Error("User already registered. Please login.");
  }

  const newUser: StoredUser = {
    id: data.email,
    name: data.name,
    email: data.email,
    password: data.password,
  };

  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });

  if (!response.ok) {
    throw new Error("Failed to register user");
  }

  const savedUser = (await response.json()) as StoredUser;

  return {
    message: "Registration successful",
    user: {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
    },
  };
};

export const logout = () => {
  // No token to remove
};
