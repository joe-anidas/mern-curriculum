// ============================================
// TypeScript Namespaces
// ============================================

// Basic Namespace
namespace Geometry {
  export const PI = 3.14159;

  export interface Point {
    x: number;
    y: number;
  }

  export class Circle {
    constructor(public radius: number) {}

    area(): number {
      return PI * this.radius * this.radius;
    }

    circumference(): number {
      return 2 * PI * this.radius;
    }
  }

  export function distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Not exported - private to namespace
  function helper() {
    return "This is private";
  }
}

// Using the namespace
const circle = new Geometry.Circle(5);
console.log("Circle Area:", circle.area());
console.log("Circle Circumference:", circle.circumference());

const point1: Geometry.Point = { x: 0, y: 0 };
const point2: Geometry.Point = { x: 3, y: 4 };
console.log("Distance:", Geometry.distance(point1, point2));

// ============================================
// Nested Namespaces
// ============================================

namespace Company {
  export namespace HR {
    export interface Employee {
      id: number;
      name: string;
      department: string;
    }

    export class EmployeeManager {
      private employees: Employee[] = [];

      addEmployee(emp: Employee): void {
        this.employees.push(emp);
      }

      getEmployee(id: number): Employee | undefined {
        return this.employees.find((e) => e.id === id);
      }
    }
  }

  export namespace Finance {
    export interface Transaction {
      id: string;
      amount: number;
      date: Date;
    }

    export function calculateTotal(transactions: Transaction[]): number {
      return transactions.reduce((sum, t) => sum + t.amount, 0);
    }
  }
}

// Using nested namespaces
const empManager = new Company.HR.EmployeeManager();
empManager.addEmployee({ id: 1, name: "John Doe", department: "IT" });

const transactions: Company.Finance.Transaction[] = [
  { id: "T1", amount: 100, date: new Date() },
  { id: "T2", amount: 200, date: new Date() },
];
console.log("Total:", Company.Finance.calculateTotal(transactions));

// ============================================
// Namespace Aliases
// ============================================

import HR = Company.HR;
import Fin = Company.Finance;

const emp: HR.Employee = { id: 2, name: "Jane Smith", department: "Sales" };
const trans: Fin.Transaction[] = [];

// ============================================
// Merging Namespaces (Declaration Merging)
// ============================================

namespace Utils {
  export function log(message: string): void {
    console.log(`[LOG]: ${message}`);
  }
}

namespace Utils {
  export function error(message: string): void {
    console.error(`[ERROR]: ${message}`);
  }
}

// Both functions are available
Utils.log("This is a log message");
Utils.error("This is an error message");

// ============================================
// Note: Modern TypeScript prefers ES6 Modules
// over Namespaces for better tooling support
// and compatibility with JavaScript ecosystem.
// Use Namespaces mainly for:
// - Organizing code in global scope
// - Legacy code or specific scenarios
// - Ambient declarations in .d.ts files
// ============================================
