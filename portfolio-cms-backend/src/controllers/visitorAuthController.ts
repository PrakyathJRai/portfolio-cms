
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { generateVisitorToken } from "../utils/visitorJwt.js";

// Registration validation
const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

// Login validation
const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

// Update visitor profile validation
const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
});

// Change password validation
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must contain at least 8 characters"),
});

// ==========================================
// VISITOR REGISTRATION
// ==========================================

export const registerVisitor = async (
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

    const existingVisitor = await prisma.visitor.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingVisitor) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const visitor = await prisma.visitor.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    const token = generateVisitorToken(visitor.id);

    res.status(201).json({
      success: true,
      message: "Visitor registered successfully",
      token,
      visitor: {
        id: visitor.id,
        name: visitor.name,
        email: visitor.email,
        createdAt: visitor.createdAt,
      },
    });
  } catch (error) {
    console.error("Visitor registration error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to register visitor",
    });
  }
};

// ==========================================
// VISITOR LOGIN
// ==========================================

export const loginVisitor = async (
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

    const visitor = await prisma.visitor.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!visitor) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      visitor.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const token = generateVisitorToken(visitor.id);

    res.status(200).json({
      success: true,
      message: "Visitor login successful",
      token,
      visitor: {
        id: visitor.id,
        name: visitor.name,
        email: visitor.email,
        createdAt: visitor.createdAt,
      },
    });
  } catch (error) {
    console.error("Visitor login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to log in visitor",
    });
  }
};

// ==========================================
// GET VISITOR PROFILE
// ==========================================

export const getVisitorProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.visitorId) {
      res.status(401).json({
        success: false,
        message: "Visitor authentication required",
      });
      return;
    }

    const visitor = await prisma.visitor.findUnique({
      where: { id: req.visitorId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!visitor) {
      res.status(404).json({
        success: false,
        message: "Visitor account not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      visitor,
    });
  } catch (error) {
    console.error("Get visitor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve visitor profile",
    });
  }
};

// ==========================================
// UPDATE VISITOR PROFILE
// ==========================================

export const updateVisitorProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.visitorId) {
      res.status(401).json({
        success: false,
        message: "Visitor authentication required",
      });
      return;
    }

    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid profile details",
        errors: validation.error.issues,
      });
      return;
    }

    const { name, email } = validation.data;
    const normalizedEmail = email.toLowerCase();

    const existingVisitor = await prisma.visitor.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingVisitor && existingVisitor.id !== req.visitorId) {
      res.status(409).json({
        success: false,
        message: "This email address is already registered.",
      });
      return;
    }

    const updatedVisitor = await prisma.visitor.update({
      where: { id: req.visitorId },
      data: {
        name,
        email: normalizedEmail,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      visitor: updatedVisitor,
    });
  } catch (error) {
    console.error("Update visitor profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update visitor profile.",
    });
  }
};

// ==========================================
// CHANGE VISITOR PASSWORD
// ==========================================

export const changeVisitorPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.visitorId) {
      res.status(401).json({
        success: false,
        message: "Visitor authentication required",
      });
      return;
    }

    // Validate password details
    const validation = changePasswordSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid password details",
        errors: validation.error.issues,
      });
      return;
    }

    const { currentPassword, newPassword } = validation.data;

    // Find authenticated visitor
    const visitor = await prisma.visitor.findUnique({
      where: { id: req.visitorId },
    });

    if (!visitor) {
      res.status(404).json({
        success: false,
        message: "Visitor account not found",
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      visitor.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    // Prevent using the same password again
    const isSamePassword = await bcrypt.compare(
      newPassword,
      visitor.password
    );

    if (isSamePassword) {
      res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await prisma.visitor.update({
      where: { id: req.visitorId },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change visitor password error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to change visitor password.",
    });
  }
};
