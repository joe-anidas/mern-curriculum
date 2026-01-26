/**
 * Demo credentials for development and testing
 * These match the frontend seed data for consistency across the app
 */

export const DEMO_CREDENTIALS = {
  superadmin: {
    name: "Alice Admin",
    email: "admin@gmail.com",
    password: "password123",
    role: "superadmin",
  },
  tenant1Admin: {
    name: "Tina Tenant",
    email: "tenant1@gmail.com",
    password: "password123",
    role: "tenantAdmin",
    organizationName: "Tenant One Workspace",
  },
  tenant2Admin: {
    name: "Oscar Org",
    email: "tenant2@gmail.com",
    password: "password123",
    role: "tenantAdmin",
    organizationName: "Tenant Two Workspace",
  },
  tenant1User1: {
    name: "Bob User",
    email: "user1@gmail.com",
    password: "password123",
    role: "user",
    organizationName: "Tenant One Workspace",
  },
  tenant1User2: {
    name: "Bella User",
    email: "user2@gmail.com",
    password: "password123",
    role: "user",
    organizationName: "Tenant One Workspace",
  },
  tenant2User1: {
    name: "Charlie User",
    email: "user3@gmail.com",
    password: "password123",
    role: "user",
    organizationName: "Tenant Two Workspace",
  },
  tenant2User2: {
    name: "Cora User",
    email: "user4@gmail.com",
    password: "password123",
    role: "user",
    organizationName: "Tenant Two Workspace",
  },
  tenant3Admin: {
    name: "Tenant Three Admin",
    email: "tenant3@gmail.com",
    password: "password123",
    role: "tenantAdmin",
    organizationName: "Tenant Three Workspace",
  },
  joeeben: {
    name: "Joe Eben",
    email: "joeben2211@gmail.com",
    password: "password123",
    role: "user",
    organizationName: "Tenant Three Workspace",
  },
};

/**
 * Get all available demo credentials
 */
export function getAllDemoCredentials() {
  return Object.entries(DEMO_CREDENTIALS).map(([key, creds]) => ({
    id: key,
    ...creds,
  }));
}
