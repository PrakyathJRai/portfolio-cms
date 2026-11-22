
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// Experience validation schema
const experienceSchema = z.object({
  company: z.string().trim().min(2, "Company name is required"),
  position: z.string().trim().min(2, "Position is required"),
  employmentType: z.string().optional(),
  location: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  currentlyWorking: z.boolean().optional(),
  description: z.string().trim().min(10, "Description is required"),
  technologies: z.array(z.string().trim().min(1)),
  companyLogo: z.string().url().optional().or(z.literal("")),
  displayOrder: z.number().int().optional(),
});

// Helper function to retrieve Experience ID
const getExperienceId = (req: Request): string | null => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  return typeof id === "string" && id.length > 0 ? id : null;
};

// GET all experiences
export const getExperiences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { displayOrder: "asc" },
    });

    res.status(200).json({
      success: true,
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    console.error("Get experiences error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve experiences",
    });
  }
};

// CREATE an experience
export const createExperience = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = experienceSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid experience information",
        errors: validation.error.issues,
      });
      return;
    }

    const experience = await prisma.experience.create({
      data: validation.data,
    });

    res.status(201).json({
      success: true,
      message: "Experience created successfully",
      data: experience,
    });
  } catch (error) {
    console.error("Create experience error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create experience",
    });
  }
};

// UPDATE an experience
export const updateExperience = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getExperienceId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Experience ID is required",
      });
      return;
    }

    const validation = experienceSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid experience information",
        errors: validation.error.issues,
      });
      return;
    }

    const existingExperience = await prisma.experience.findUnique({
      where: { id },
    });

    if (!existingExperience) {
      res.status(404).json({
        success: false,
        message: "Experience not found",
      });
      return;
    }

    const experience = await prisma.experience.update({
      where: { id },
      data: validation.data,
    });

    res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      data: experience,
    });
  } catch (error) {
    console.error("Update experience error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update experience",
    });
  }
};

// DELETE an experience
export const deleteExperience = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getExperienceId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Experience ID is required",
      });
      return;
    }

    const existingExperience = await prisma.experience.findUnique({
      where: { id },
    });

    if (!existingExperience) {
      res.status(404).json({
        success: false,
        message: "Experience not found",
      });
      return;
    }

    await prisma.experience.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Experience deleted successfully",
    });
  } catch (error) {
    console.error("Delete experience error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete experience",
    });
  }
};
