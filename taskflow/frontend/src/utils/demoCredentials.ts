/**
 * Demo credentials for development and testing
 * These match the backend seed data for easy testing
 */

export const DEMO_CREDENTIALS = {
  superadmin: {
    email: "admin@gmail.com",
    password: "password123",
    name: "Alice Admin",
    role: "superadmin",
  },
  tenant1Admin: {
    email: "tenant1@gmail.com",
    password: "password123",
    name: "Tina Tenant",
    role: "tenantAdmin",
    organization: "Tenant One Workspace",
  },
  tenant2Admin: {
    email: "tenant2@gmail.com",
    password: "password123",
    name: "Oscar Org",
    role: "tenantAdmin",
    organization: "Tenant Two Workspace",
  },
  tenant1User1: {
    email: "user1@gmail.com",
    password: "password123",
    name: "Bob User",
    role: "user",
    organization: "Tenant One Workspace",
  },
  tenant1User2: {
    email: "user2@gmail.com",
    password: "password123",
    name: "Bella User",
    role: "user",
    organization: "Tenant One Workspace",
  },
  tenant2User1: {
    email: "user3@gmail.com",
    password: "password123",
    name: "Charlie User",
    role: "user",
    organization: "Tenant Two Workspace",
  },
  tenant2User2: {
    email: "user4@gmail.com",
    password: "password123",
    name: "Cora User",
    role: "user",
    organization: "Tenant Two Workspace",
  },
  tenant3Admin: {
    email: "tenant3@gmail.com",
    password: "password123",
    name: "Tenant Three Admin",
    role: "tenantAdmin",
    organization: "Tenant Three Workspace",
  },
  joeeben: {
    email: "joeben2211@gmail.com",
    password: "password123",
    name: "Joe Eben",
    role: "user",
    organization: "Tenant Three Workspace",
  },
};

/**
 * Get all available demo credentials for quick reference
 */
export function getAllDemoCredentials() {
  return Object.entries(DEMO_CREDENTIALS).map(([key, creds]) => ({
    id: key,
    ...creds,
  }));
}

/**
 * Prefill login form with demo credentials
 */
export function prefillLoginForm(credentialKey: keyof typeof DEMO_CREDENTIALS) {
  const credentials = DEMO_CREDENTIALS[credentialKey];
  if (credentials) {
    return {
      email: credentials.email,
      password: credentials.password,
    };
  }
  return null;
}
