
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

const aboutSchema = z.object({
  fullName: z.string().trim().min(2),
  title: z.string().trim().min(2),
  bio: z.string().trim().min(10),
  profileImage: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal("")),
});

// GET About information
export const getAbout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const about = await prisma.about.findFirst();

    res.status(200).json({
      success: true,
      data: about,
    });
  } catch (error) {
    console.error("Get About error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve About information",
    });
  }
};

// CREATE About information
export const createAbout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = aboutSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid About information",
        errors: validation.error.issues,
      });
      return;
    }

    const existingAbout = await prisma.about.findFirst();

    if (existingAbout) {
      res.status(409).json({
        success: false,
        message: "About information already exists. Use PUT to update it.",
      });
      return;
    }

    const about = await prisma.about.create({
      data: validation.data,
    });

    res.status(201).json({
      success: true,
      message: "About information created successfully",
      data: about,
    });
  } catch (error) {
    console.error("Create About error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create About information",
    });
  }
};

// UPDATE About information
export const updateAbout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = aboutSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid About information",
        errors: validation.error.issues,
      });
      return;
    }

    const existingAbout = await prisma.about.findFirst();

    if (!existingAbout) {
      res.status(404).json({
        success: false,
        message: "About information not found. Create it first.",
      });
      return;
    }

    const about = await prisma.about.update({
      where: { id: existingAbout.id },
      data: validation.data,
    });

    res.status(200).json({
      success: true,
      message: "About information updated successfully",
      data: about,
    });
  } catch (error) {
    console.error("Update About error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update About information",
    });
  }
};
