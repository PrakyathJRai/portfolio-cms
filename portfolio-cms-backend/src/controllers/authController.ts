
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { generateToken } from "../utils/jwt.js";
// ==========================================
// REGISTRATION VALIDATION
// ==========================================

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

// ==========================================
// ADMIN REGISTRATION
// ==========================================

export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid registration details",
        errors: validation.error.issues,
      });
      return;
    }

    const { name, email, password } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // Allow registration only when no admin exists
    const adminCount = await prisma.admin.count();

    if (adminCount > 0) {
      res.status(403).json({
        success: false,
        message: "Admin registration is closed",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = generateToken(admin.id);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// LOGIN VALIDATION
// ==========================================

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

// ==========================================
// ADMIN LOGIN
// ==========================================

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid login details",
        errors: validation.error.issues,
      });
      return;
    }

    const { email, password } = validation.data;

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate JWT
    const token = generateToken(admin.id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
