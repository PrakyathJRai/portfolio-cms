
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";

const messageSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(3, "Subject is required").max(150),
  message: z.string().trim().min(10, "Message must contain at least 10 characters").max(5000),
});

const getMessageId = (req: Request): string | null => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  return typeof id === "string" && id.length > 0 ? id : null;
};

// Public: Submit a contact message
export const createMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = messageSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid contact information",
        errors: validation.error.issues,
      });
      return;
    }

    const message = await prisma.message.create({
      data: validation.data,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully",
      data: message,
    });
  } catch (error) {
    console.error("Create message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit your message",
    });
  }
};

// Admin: Retrieve all contact messages
export const getMessages = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
    });
  }
};

// Admin: Mark a message as read
export const markMessageAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getMessageId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Message ID is required",
      });
      return;
    }

    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      res.status(404).json({
        success: false,
        message: "Message not found",
      });
      return;
    }

    const message = await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    console.error("Mark message as read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update message",
    });
  }
};

// Admin: Delete a contact message
export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getMessageId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Message ID is required",
      });
      return;
    }

    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      res.status(404).json({
        success: false,
        message: "Message not found",
      });
      return;
    }

    await prisma.message.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};
