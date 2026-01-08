export function isValidEmail(email: string): boolean {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string) {
  if (!password || password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  return { valid: true };
}

export function isValidTaskTitle(title: string) {
  if (!title || typeof title !== "string") {
    return { valid: false, message: "Title is required and must be a string" };
  }
  if (title.trim().length === 0) {
    return { valid: false, message: "Title cannot be empty" };
  }
  if (title.length > 200) {
    return { valid: false, message: "Title cannot exceed 200 characters" };
  }
  return { valid: true };
}

export function isValidTaskStatus(status: string) {
  const validStatuses = ["todo", "in-progress", "completed"];
  if (!validStatuses.includes(status)) {
    return {
      valid: false,
      message: `Status must be one of: ${validStatuses.join(", ")}`,
    };
  }
  return { valid: true };
}

export function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function isValidName(name: string) {
  if (!name || typeof name !== "string") {
    return { valid: false, message: "Name is required and must be a string" };
  }
  if (name.trim().length < 2) {
    return { valid: false, message: "Name must be at least 2 characters" };
  }
  if (name.length > 50) {
    return { valid: false, message: "Name cannot exceed 50 characters" };
  }
  return { valid: true };
}

export function sanitizeInput(input: unknown, maxLength = 500) {
  if (typeof input !== "string") return "";
  return input.trim().substring(0, maxLength);
}
