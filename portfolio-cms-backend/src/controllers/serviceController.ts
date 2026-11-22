
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// Service validation schema
const serviceSchema = z.object({
  title: z.string().trim().min(2, "Service title is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Service slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid service slug"),
  description: z.string().trim().min(10, "Description is required"),
  icon: z.string().optional(),
  features: z.array(z.string().trim().min(1)),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

// Helper function to retrieve service ID
const getServiceId = (req: Request): string | null => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  return typeof id === "string" && id.length > 0 ? id : null;
};

// GET all services
export const getServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { displayOrder: "asc" },
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Get services error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve services",
    });
  }
};

// CREATE a service
export const createService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = serviceSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid service information",
        errors: validation.error.issues,
      });
      return;
    }

    const service = await prisma.service.create({
      data: validation.data,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("Create service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

// UPDATE a service
export const updateService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getServiceId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
      return;
    }

    const validation = serviceSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid service information",
        errors: validation.error.issues,
      });
      return;
    }

    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      res.status(404).json({
        success: false,
        message: "Service not found",
      });
      return;
    }

    const service = await prisma.service.update({
      where: { id },
      data: validation.data,
    });

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Update service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};

// DELETE a service
export const deleteService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getServiceId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
      return;
    }

    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      res.status(404).json({
        success: false,
        message: "Service not found",
      });
      return;
    }

    await prisma.service.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};
