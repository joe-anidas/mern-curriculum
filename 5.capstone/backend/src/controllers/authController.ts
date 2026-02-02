import { Request, Response, NextFunction } from "express";
import User, { UserRole, IUser } from "../models/User";
import Organization from "../models/Organization";
import PasswordReset from "../models/PasswordReset";
import { signJwt, AuthenticatedRequest } from "../middleware/auth";
import {
  isValidEmail,
  isValidPassword,
  isValidObjectId,
  isValidName,
} from "../utils/validators";
import { sendPasswordResetEmail, generateOTP } from "../services/emailService";

const buildAuthToken = (user: IUser) =>
  signJwt(
    {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId ? user.tenantId.toString() : undefined,
    },
    { expiresIn: "7d" },
  );

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      name,
      email,
      password,
      tenantId: tenantIdRaw,
      organizationName,
    } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      tenantId?: string;
      organizationName?: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    const nameCheck = isValidName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ success: false, error: nameCheck.message });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide a valid email" });
    }

    const pw = isValidPassword(password);
    if (!pw.valid) {
      return res.status(400).json({ success: false, error: pw.message });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    const totalUsers = await User.countDocuments();

    let role: UserRole = "user";
    let tenantId = tenantIdRaw;
    const orgName = organizationName?.trim();

    if (totalUsers === 0) {
      role = "superadmin";
      tenantId = undefined;
    } else {
      if (tenantId && !isValidObjectId(tenantId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid tenant identifier" });
      }

      if (tenantId) {
        const tenant = await Organization.findById(tenantId);
        if (!tenant) {
          return res
            .status(400)
            .json({ success: false, error: "Tenant not found" });
        }
        role = "user";
      } else {
        const finalOrgName =
          orgName && orgName.length >= 2 && orgName.length <= 100
            ? orgName
            : `${name}'s Workspace`;

        const existingOrg = await Organization.findOne({ name: finalOrgName });
        if (existingOrg) {
          return res.status(409).json({
            success: false,
            error: "Organization name already exists",
          });
        }

        const organization = new Organization({ name: finalOrgName });
        await organization.save();
        tenantId = organization._id.toString();
        role = "tenantAdmin";
      }
    }

    const user = new User({
      name,
      email,
      passwordHash: password,
      role,
      tenantId,
    });
    await user.save();

    const token = buildAuthToken(user);

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId ? user.tenantId.toString() : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = buildAuthToken(user);

    return res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId ? user.tenantId.toString() : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createTenantUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const {
      name,
      email,
      password,
      role: requestedRole,
      tenantId: bodyTenantId,
    } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      tenantId?: string;
    };

    console.log("[createTenantUser] Request:", {
      actorId: actor.userId,
      actorRole: actor.role,
      requestedRole,
      bodyTenantId,
    });

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    const nameCheck = isValidName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ success: false, error: nameCheck.message });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide a valid email" });
    }

    const pw = isValidPassword(password);
    if (!pw.valid) {
      return res.status(400).json({ success: false, error: pw.message });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    let tenantId = actor.tenantId;
    let role: UserRole = "user";

    if (actor.role === "superadmin") {
      if (!bodyTenantId || !isValidObjectId(bodyTenantId)) {
        return res
          .status(400)
          .json({ success: false, error: "Valid tenantId is required" });
      }
      tenantId = bodyTenantId;
      role = requestedRole === "tenantAdmin" ? "tenantAdmin" : "user";

      // Enforce single tenant admin rule
      if (role === "tenantAdmin") {
        const existingAdmin = await User.findOne({
          tenantId,
          role: "tenantAdmin",
        });

        if (existingAdmin) {
          return res.status(409).json({
            success: false,
            error: "This organization already has a Tenant Admin",
          });
        }
      }
    } else {
      // Tenant admins can only create users inside their own tenant
      role = "user";
    }

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: "Tenant context is required to create users",
      });
    }

    const tenantExists = await Organization.exists({ _id: tenantId });
    if (!tenantExists) {
      return res
        .status(404)
        .json({ success: false, error: "Tenant not found" });
    }

    const user = new User({
      name,
      email,
      passwordHash: password,
      role,
      tenantId,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId ? user.tenantId.toString() : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    let filter: Record<string, unknown> = {};

    if (actor.role === "tenantAdmin") {
      if (!actor.tenantId) {
        return res.status(400).json({
          success: false,
          error: "Missing tenant context for tenant admin",
        });
      }
      filter = { tenantId: actor.tenantId };
    } else if (actor.role === "superadmin") {
      filter = {};
    } else {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        tenantId: u.tenantId ? u.tenantId.toString() : null,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrganization(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!actor.tenantId) {
      return res.json({ success: true, organization: null });
    }

    const organization = await Organization.findById(actor.tenantId);

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: "Organization not found" });
    }

    return res.json({
      success: true,
      organization: {
        id: organization._id.toString(),
        name: organization.name,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllOrganizations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user;
    if (!actor || actor.role !== "superadmin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const organizations = await Organization.find({})
      .select("name _id")
      .sort({ name: 1 });

    // Fetch all tenant admins to identify which organizations already have one
    const tenantAdmins = await User.find({ role: "tenantAdmin" }).select(
      "tenantId",
    );
    const tenantAdminMap = new Set(
      tenantAdmins.map((u) => u.tenantId?.toString()),
    );

    return res.json({
      success: true,
      organizations: organizations.map((org) => ({
        id: org._id.toString(),
        name: org.name,
        hasTenantAdmin: tenantAdminMap.has(org._id.toString()),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createOrganization(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user;
    if (!actor || actor.role !== "superadmin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const { name } = req.body as { name?: string };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Organization name is required" });
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Organization name must be between 2 and 100 characters",
      });
    }

    const existingOrg = await Organization.findOne({ name: trimmedName });
    if (existingOrg) {
      return res.status(409).json({
        success: false,
        error: "Organization with this name already exists",
      });
    }

    const organization = new Organization({
      name: trimmedName,
      createdBy: actor.userId,
    });

    await organization.save();

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization: {
        id: organization._id.toString(),
        name: organization.name,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateOrganizationName(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { name, tenantId: bodyTenantId } = req.body as {
      name?: string;
      tenantId?: string;
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Organization name is required" });
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Organization name must be between 2 and 100 characters",
      });
    }

    let targetTenantId = actor.tenantId;

    if (actor.role === "superadmin") {
      if (!bodyTenantId || !isValidObjectId(bodyTenantId)) {
        return res.status(400).json({
          success: false,
          error: "Valid tenantId is required for superadmin updates",
        });
      }
      targetTenantId = bodyTenantId;
    }

    if (!targetTenantId) {
      return res.status(400).json({
        success: false,
        error: "Tenant context is required to update organization name",
      });
    }

    const existingOrg = await Organization.findOne({
      name: trimmedName,
      _id: { $ne: targetTenantId },
    });

    if (existingOrg) {
      return res.status(409).json({
        success: false,
        error: "Organization name already exists",
      });
    }

    const organization = await Organization.findById(targetTenantId);

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, error: "Organization not found" });
    }

    organization.name = trimmedName;
    await organization.save();

    return res.json({
      success: true,
      organization: {
        id: organization._id.toString(),
        name: organization.name,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    console.log(`✅ User ${req.user?.userId} logged out successfully`);

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.json({
      success: true,
      message: "Logged out",
    });
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email } = req.body as { email?: string };

    if (!email || !isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Valid email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Don't reveal if user exists for security
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists, a password reset link has been sent",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await PasswordReset.deleteMany({ userId: user._id }); // Remove old reset requests
    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      otp,
      isVerified: false,
      expiresAt,
    });

    // Send OTP email
    try {
      await sendPasswordResetEmail(user.email, otp);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        error: "Failed to send password reset email. Please try again.",
      });
    }

    return res.json({
      success: true,
      message: "Password reset OTP has been sent to your email",
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyOTP(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or OTP",
      });
    }

    const resetRecord = await PasswordReset.findOne({
      userId: user._id,
      email: user.email,
    }).select("+otp");

    if (!resetRecord) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or OTP",
      });
    }

    if (new Date() > resetRecord.expiresAt) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return res.status(401).json({
        success: false,
        error: "OTP has expired. Please request a new one.",
      });
    }

    if (resetRecord.otp !== otp) {
      return res.status(401).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    // Mark as verified
    resetRecord.isVerified = true;
    await resetRecord.save();

    return res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken: resetRecord._id.toString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { resetToken, newPassword } = req.body as {
      resetToken?: string;
      newPassword?: string;
    };

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Reset token and new password are required",
      });
    }

    const pw = isValidPassword(newPassword);
    if (!pw.valid) {
      return res.status(400).json({ success: false, error: pw.message });
    }

    if (!isValidObjectId(resetToken)) {
      return res.status(401).json({
        success: false,
        error: "Invalid reset token",
      });
    }

    const resetRecord = await PasswordReset.findById(resetToken);

    if (!resetRecord || !resetRecord.isVerified) {
      return res.status(401).json({
        success: false,
        error: "Invalid or unverified reset token",
      });
    }

    if (new Date() > resetRecord.expiresAt) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return res.status(401).json({
        success: false,
        error: "Reset token has expired",
      });
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    // Delete reset record
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    return res.json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    const { name, email, role } = req.body as {
      name?: string;
      email?: string;
      role?: UserRole;
    };

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid user identifier" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Permission checks
    if (actor.role === "tenantAdmin") {
      if (
        !actor.tenantId ||
        targetUser.tenantId?.toString() !== actor.tenantId
      ) {
        return res.status(403).json({
          success: false,
          error: "Cannot update users outside your tenant",
        });
      }
      // Tenant admins can't update other admins or superadmins
      if (targetUser.role !== "user") {
        return res.status(403).json({
          success: false,
          error: "Cannot update admin users",
        });
      }
    } else if (actor.role !== "superadmin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    // Update fields
    if (name) {
      const nameCheck = isValidName(name);
      if (!nameCheck.valid) {
        return res
          .status(400)
          .json({ success: false, error: nameCheck.message });
      }
      targetUser.name = name;
    }

    if (email) {
      if (!isValidEmail(email)) {
        return res
          .status(400)
          .json({ success: false, error: "Please provide a valid email" });
      }
      const existingUser = await User.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists",
        });
      }
      targetUser.email = email;
    }

    if (role) {
      if (actor.role === "tenantAdmin") {
        return res.status(403).json({
          success: false,
          error: "Tenant admins cannot change user roles",
        });
      }
      targetUser.role = role;
    }

    await targetUser.save();

    return res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        tenantId: targetUser.tenantId ? targetUser.tenantId.toString() : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user;
    if (!actor) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { id } = req.params as { id: string };

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid user identifier" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Can't delete yourself
    if (targetUser._id.toString() === actor.userId) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete your own account",
      });
    }

    // Permission checks
    if (actor.role === "tenantAdmin") {
      if (
        !actor.tenantId ||
        targetUser.tenantId?.toString() !== actor.tenantId
      ) {
        return res.status(403).json({
          success: false,
          error: "Cannot delete users outside your tenant",
        });
      }
      // Tenant admins can't delete other admins or superadmins
      if (targetUser.role !== "user") {
        return res.status(403).json({
          success: false,
          error: "Cannot delete admin users",
        });
      }
    } else if (actor.role !== "superadmin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    await User.deleteOne({ _id: id });

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
