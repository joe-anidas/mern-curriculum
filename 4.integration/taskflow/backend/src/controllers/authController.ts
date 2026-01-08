import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { signJwt } from "../middleware/auth";
import {
  isValidEmail,
  isValidPassword,
  isValidName,
} from "../utils/validators";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, password required" });
    }

    const nameValidation = isValidName(name);
    if (!nameValidation.valid) {
      return res.status(400).json({ error: nameValidation.message });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "invalid email format" });
    }

    const pw = isValidPassword(password);
    if (!pw.valid) {
      return res.status(400).json({ error: pw.message });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "email already registered" });
    }

    const user = new User({ name, email, passwordHash: password });
    await user.save();

    const token = signJwt({ userId: user._id.toString(), email: user.email });

    return res.status(201).json({
      message: "registered",
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "invalid email format" });
    }

    const pw = isValidPassword(password);
    if (!pw.valid) {
      return res.status(400).json({ error: pw.message });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const ok = await user.matchPassword(password);
    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = signJwt({ userId: user._id.toString(), email: user.email });

    return res.json({
      message: "logged in",
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}
