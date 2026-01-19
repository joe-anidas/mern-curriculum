export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "user" | "tenantAdmin" | "superadmin";
  tenantId?: string;
  fcmTokens?: string[];
}
