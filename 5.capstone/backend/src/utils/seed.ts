import mongoose from "mongoose";
import User from "../models/User";
import Task from "../models/Task";
import Organization from "../models/Organization";
import { MONGO_URI } from "../config/env";
import { DEMO_CREDENTIALS } from "./demoCredentials";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      Task.deleteMany({}),
      User.deleteMany({}),
      Organization.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing data");

    // Create organizations
    const org1 = new Organization({ name: "Tenant One Workspace" });
    await org1.save();

    const org2 = new Organization({ name: "Tenant Two Workspace" });
    await org2.save();

    const org3 = new Organization({ name: "Tenant Three Workspace" });
    await org3.save();

    console.log("✅ Created organizations");

    // Create superadmin (first user - no tenant)
    const admin = new User({
      name: DEMO_CREDENTIALS.superadmin.name,
      email: DEMO_CREDENTIALS.superadmin.email,
      passwordHash: DEMO_CREDENTIALS.superadmin.password,
      role: DEMO_CREDENTIALS.superadmin.role,
    });
    await admin.save();
    console.log(`✅ Created superadmin: ${DEMO_CREDENTIALS.superadmin.email}`);

    // Create tenant admins
    const tenant1Admin = new User({
      name: DEMO_CREDENTIALS.tenant1Admin.name,
      email: DEMO_CREDENTIALS.tenant1Admin.email,
      passwordHash: DEMO_CREDENTIALS.tenant1Admin.password,
      role: DEMO_CREDENTIALS.tenant1Admin.role,
      tenantId: org1._id,
    });
    await tenant1Admin.save();
    console.log(
      `✅ Created tenant admin: ${DEMO_CREDENTIALS.tenant1Admin.email}`
    );

    const tenant2Admin = new User({
      name: DEMO_CREDENTIALS.tenant2Admin.name,
      email: DEMO_CREDENTIALS.tenant2Admin.email,
      passwordHash: DEMO_CREDENTIALS.tenant2Admin.password,
      role: DEMO_CREDENTIALS.tenant2Admin.role,
      tenantId: org2._id,
    });
    await tenant2Admin.save();
    console.log(
      `✅ Created tenant admin: ${DEMO_CREDENTIALS.tenant2Admin.email}`
    );

    const tenant3Admin = new User({
      name: DEMO_CREDENTIALS.tenant3Admin.name,
      email: DEMO_CREDENTIALS.tenant3Admin.email,
      passwordHash: DEMO_CREDENTIALS.tenant3Admin.password,
      role: DEMO_CREDENTIALS.tenant3Admin.role,
      tenantId: org3._id,
    });
    await tenant3Admin.save();
    console.log(
      `✅ Created tenant admin: ${DEMO_CREDENTIALS.tenant3Admin.email}`
    );

    // Create regular users for tenant 1
    const tenant1Users = [
      DEMO_CREDENTIALS.tenant1User1,
      DEMO_CREDENTIALS.tenant1User2,
    ];

    for (const u of tenant1Users) {
      await new User({
        name: u.name,
        email: u.email,
        passwordHash: u.password,
        role: u.role,
        tenantId: org1._id,
      }).save();
    }

    // Create regular users for tenant 2
    const tenant2Users = [
      DEMO_CREDENTIALS.tenant2User1,
      DEMO_CREDENTIALS.tenant2User2,
    ];

    for (const u of tenant2Users) {
      await new User({
        name: u.name,
        email: u.email,
        passwordHash: u.password,
        role: u.role,
        tenantId: org2._id,
      }).save();
    }

    // Create regular users for tenant 3
    const tenant3Users = [DEMO_CREDENTIALS.joeeben];

    for (const u of tenant3Users) {
      await new User({
        name: u.name,
        email: u.email,
        passwordHash: u.password,
        role: u.role,
        tenantId: org3._id,
      }).save();
    }

    console.log("✅ Created regular users");
    console.log("\n🎉 Seeding completed successfully!");
    console.log("\nTest credentials:");
    console.log(
      `  Superadmin: ${DEMO_CREDENTIALS.superadmin.email} / ${DEMO_CREDENTIALS.superadmin.password}`
    );
    console.log(
      `  Tenant 1 Admin: ${DEMO_CREDENTIALS.tenant1Admin.email} / ${DEMO_CREDENTIALS.tenant1Admin.password}`
    );
    console.log(
      `  Tenant 2 Admin: ${DEMO_CREDENTIALS.tenant2Admin.email} / ${DEMO_CREDENTIALS.tenant2Admin.password}`
    );
    console.log(
      `  Tenant 3 Admin: ${DEMO_CREDENTIALS.tenant3Admin.email} / ${DEMO_CREDENTIALS.tenant3Admin.password}`
    );
    console.log(
      `  Tenant1 User 1: ${DEMO_CREDENTIALS.tenant1User1.email} / ${DEMO_CREDENTIALS.tenant1User1.password}`
    );
    console.log(
      `  Tenant1 User 2: ${DEMO_CREDENTIALS.tenant1User2.email} / ${DEMO_CREDENTIALS.tenant1User2.password}`
    );
    console.log(
      `  Tenant2 User 1: ${DEMO_CREDENTIALS.tenant2User1.email} / ${DEMO_CREDENTIALS.tenant2User1.password}`
    );
    console.log(
      `  Tenant2 User 2: ${DEMO_CREDENTIALS.tenant2User2.email} / ${DEMO_CREDENTIALS.tenant2User2.password}`
    );
    console.log(
      `  Tenant3 User (JoeEben): ${DEMO_CREDENTIALS.joeeben.email} / ${DEMO_CREDENTIALS.joeeben.password}`
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
