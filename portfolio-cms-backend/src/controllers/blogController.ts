
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

// Blog validation schema
const blogSchema = z.object({
  title: z.string().trim().min(2, "Blog title is required"),

  slug: z
    .string()
    .trim()
    .min(2, "Blog slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid blog slug"),

  excerpt: z.string().optional(),

  content: z.string().trim().min(10, "Blog content is required"),

  coverImage: z.string().url().optional().or(z.literal("")),

  category: z.string().optional(),

  tags: z.array(z.string().trim().min(1)),

  published: z.boolean().optional(),

  publishedAt: z.coerce.date().nullable().optional(),

  displayOrder: z.number().int().optional(),
});

// Helper function to safely retrieve blog ID
const getBlogId = (req: Request): string | null => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  return typeof id === "string" && id.length > 0 ? id : null;
};

// GET all blogs
export const getBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: {
        displayOrder: "asc",
      },
    });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Get blogs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve blogs",
    });
  }
};

// CREATE a blog
export const createBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = blogSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid blog information",
        errors: validation.error.issues,
      });
      return;
    }

    const blog = await prisma.blog.create({
      data: validation.data,
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Create blog error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create blog",
    });
  }
};

// UPDATE a blog
export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getBlogId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Blog ID is required",
      });
      return;
    }

    const validation = blogSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid blog information",
        errors: validation.error.issues,
      });
      return;
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      });
      return;
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: validation.data,
    });

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Update blog error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update blog",
    });
  }
};

// DELETE a blog
export const deleteBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getBlogId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Blog ID is required",
      });
      return;
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      });
      return;
    }

    await prisma.blog.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
    });
  }
};
