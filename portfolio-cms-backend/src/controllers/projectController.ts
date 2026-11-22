
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// Project validation schema
const projectSchema = z.object({
  title: z.string().trim().min(2, "Project title is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Project slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid project slug"),
  shortDescription: z.string().optional(),
  description: z.string().trim().min(10, "Description is required"),
  thumbnail: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  technologies: z.array(z.string().trim().min(1)).min(1),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

// Helper function to safely retrieve project ID
const getProjectId = (req: Request): string | null => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  return typeof id === "string" && id.length > 0 ? id : null;
};

// GET all projects
export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        displayOrder: "asc",
      },
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve projects",
    });
  }
};

// CREATE a project
export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = projectSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid project information",
        errors: validation.error.issues,
      });
      return;
    }

    const project = await prisma.project.create({
      data: validation.data,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

// UPDATE a project
export const updateProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getProjectId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
      return;
    }

    const validation = projectSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid project information",
        errors: validation.error.issues,
      });
      return;
    }

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: validation.data,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

// DELETE a project
export const deleteProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getProjectId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
      return;
    }

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};
