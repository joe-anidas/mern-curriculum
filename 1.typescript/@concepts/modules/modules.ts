// ============================================
// ES6 Modules - Import/Export
// ============================================

// Named Exports
export const PI = 3.14159;
export const E = 2.71828;

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

// Export Interface
export interface User {
  id: number;
  name: string;
  email: string;
}

// Export Type Alias
export type Status = "active" | "inactive" | "pending";

// Export Class
export class Calculator {
  multiply(a: number, b: number): number {
    return a * b;
  }

  divide(a: number, b: number): number {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
  }
}

// Default Export (can only have one per file)
export default class MathUtils {
  static square(n: number): number {
    return n * n;
  }

  static cube(n: number): number {
    return n * n * n;
  }
}

// Export all at once (alternative syntax)
const version = "1.0.0";
const author = "TypeScript Developer";

export { version, author };

// ============================================
// Usage Examples (in another file):
// ============================================

// Import named exports
// import { add, subtract, PI } from './modules';

// Import with alias
// import { add as addition, Calculator } from './modules';

// Import default export
// import MathUtils from './modules';

// Import default with named exports
// import MathUtils, { PI, Calculator } from './modules';

// Import everything as namespace
// import * as Math from './modules';
// Math.add(5, 3);
// Math.PI;

// Re-export from another module
// export { add, subtract } from './modules';
// export * from './modules';
