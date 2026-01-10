import { DEMO_CREDENTIALS } from "./demoCredentials";

const DEMO_SEED_KEY = "demo-credentials-seeded";

/**
 * Seed demo credentials to localStorage on first app load
 * Prevents re-seeding if already done
 */
export function seedDemoCredentials() {
  // Check if already seeded
  const isSeeded = localStorage.getItem(DEMO_SEED_KEY);

  if (!isSeeded) {
    // Store demo credentials in localStorage
    localStorage.setItem("demoCredentials", JSON.stringify(DEMO_CREDENTIALS));
    localStorage.setItem(DEMO_SEED_KEY, "true");
    console.log("✅ Demo credentials seeded to localStorage");
  }
}

/**
 * Get demo credentials from localStorage
 */
export function getDemoCredentialsFromStorage() {
  try {
    const stored = localStorage.getItem("demoCredentials");
    return stored ? JSON.parse(stored) : DEMO_CREDENTIALS;
  } catch {
    return DEMO_CREDENTIALS;
  }
}

/**
 * Reset demo credentials seeding (for development)
 */
export function resetDemoSeed() {
  localStorage.removeItem(DEMO_SEED_KEY);
  localStorage.removeItem("demoCredentials");
  console.log("✅ Demo seed reset");
}
