
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// Skill validation schema
const skillSchema = z.object({
  name: z.string().trim().min(2, "Skill name is required"),
  category: z.string().trim().min(2, "Category is required"),
  proficiency: z.number().int().min(0).max(100),
  experience: z.number().min(0).optional(),
  icon: z.string().optional(),
  displayOrder: z.number().int().optional(),
});

// Helper function to safely retrieve the skill ID
const getSkillId = (req: Request): string | null => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  return typeof id === "string" && id.length > 0 ? id : null;
};

// GET all skills
export const getSkills = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        displayOrder: "asc",
      },
    });

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Get skills error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve skills",
    });
  }
};

// CREATE a skill
export const createSkill = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = skillSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid skill information",
        errors: validation.error.issues,
      });
      return;
    }

    const skill = await prisma.skill.create({
      data: validation.data,
    });

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Create skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create skill",
    });
  }
};

// UPDATE a skill
export const updateSkill = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getSkillId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Skill ID is required",
      });
      return;
    }

    const validation = skillSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid skill information",
        errors: validation.error.issues,
      });
      return;
    }

    const existingSkill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!existingSkill) {
      res.status(404).json({
        success: false,
        message: "Skill not found",
      });
      return;
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: validation.data,
    });

    res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Update skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update skill",
    });
  }
};

// DELETE a skill
export const deleteSkill = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getSkillId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Skill ID is required",
      });
      return;
    }

    const existingSkill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!existingSkill) {
      res.status(404).json({
        success: false,
        message: "Skill not found",
      });
      return;
    }

    await prisma.skill.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Delete skill error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete skill",
    });
  }
};
