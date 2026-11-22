
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// Testimonial validation schema
const testimonialSchema = z.object({
  clientName: z.string().trim().min(2, "Client name is required"),
  clientTitle: z.string().optional(),
  company: z.string().optional(),
  message: z.string().trim().min(10, "Testimonial message is required"),
  profileImage: z.string().url().optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

// Helper function to retrieve testimonial ID
const getTestimonialId = (req: Request): string | null => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  return typeof id === "string" && id.length > 0 ? id : null;
};

// GET all testimonials
export const getTestimonials = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { displayOrder: "asc" },
    });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    console.error("Get testimonials error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve testimonials",
    });
  }
};

// CREATE a testimonial
export const createTestimonial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = testimonialSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid testimonial information",
        errors: validation.error.issues,
      });
      return;
    }

    const testimonial = await prisma.testimonial.create({
      data: validation.data,
    });

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: testimonial,
    });
  } catch (error) {
    console.error("Create testimonial error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create testimonial",
    });
  }
};

// UPDATE a testimonial
export const updateTestimonial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getTestimonialId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Testimonial ID is required",
      });
      return;
    }

    const validation = testimonialSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid testimonial information",
        errors: validation.error.issues,
      });
      return;
    }

    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
      return;
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: validation.data,
    });

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: testimonial,
    });
  } catch (error) {
    console.error("Update testimonial error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update testimonial",
    });
  }
};

// DELETE a testimonial
export const deleteTestimonial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getTestimonialId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Testimonial ID is required",
      });
      return;
    }

    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
      return;
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Delete testimonial error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
    });
  }
};
