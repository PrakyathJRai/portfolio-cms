
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface VisitorTokenPayload extends jwt.JwtPayload {
  visitorId: string;
}

declare global {
  namespace Express {
    interface Request {
      visitorId?: string;
    }
  }
}

const VISITOR_JWT_SECRET = process.env.JWT_VISITOR_SECRET;

if (!VISITOR_JWT_SECRET) {
  throw new Error("JWT_VISITOR_SECRET is missing in environment variables");
}

export const authenticateVisitor = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Visitor authentication token is required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Invalid visitor authentication token",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      VISITOR_JWT_SECRET
    ) as VisitorTokenPayload;

    if (!decoded.visitorId) {
      res.status(401).json({
        success: false,
        message: "Invalid visitor token payload",
      });
      return;
    }

    req.visitorId = decoded.visitorId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired visitor authentication token",
    });
  }
};
