
import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import fs from "node:fs/promises";
import path from "node:path";

// ==========================================
// UPLOAD MEDIA
// ==========================================

export const uploadMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select an image to upload",
      });
      return;
    }

    const media = await prisma.media.create({
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: `/uploads/${req.file.filename}`,
      },
    });

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: media,
    });
  } catch (error) {
    console.error("Media upload error:", error);

    // Remove uploaded file if database operation fails
    if (req.file) {
      try {
        await fs.unlink(path.resolve("uploads", req.file.filename));
      } catch (cleanupError) {
        console.error("Uploaded file cleanup failed:", cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload image",
    });
  }
};

// ==========================================
// GET ALL MEDIA
// ==========================================

export const getMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const media = await prisma.media.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (error) {
    console.error("Get media error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve media",
    });
  }
};

// ==========================================
// DELETE MEDIA
// ==========================================

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

if (typeof id !== "string") {
  res.status(400).json({
    success: false,
    message: "Invalid media ID",
  });
  return;
}

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      res.status(404).json({
        success: false,
        message: "Image not found",
      });
      return;
    }

    // Safely resolve the image path
    const uploadsDirectory = path.resolve("uploads");

    const filePath = path.resolve(
      uploadsDirectory,
      path.basename(media.filePath)
    );

    // Prevent deletion outside the uploads directory
    if (path.dirname(filePath) !== uploadsDirectory) {
      res.status(400).json({
        success: false,
        message: "Invalid image path",
      });
      return;
    }

    // Delete physical image file
    try {
      await fs.unlink(filePath);
    } catch (error) {
      const fileError = error as NodeJS.ErrnoException;

      if (fileError.code !== "ENOENT") {
        throw error;
      }
    }

    // Delete database record
    await prisma.media.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Media deletion error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
};

