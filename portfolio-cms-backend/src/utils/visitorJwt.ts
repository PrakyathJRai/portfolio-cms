
import jwt from "jsonwebtoken";

const VISITOR_JWT_SECRET = process.env.JWT_VISITOR_SECRET;

if (!VISITOR_JWT_SECRET) {
  throw new Error("JWT_VISITOR_SECRET is missing in environment variables");
}

export const generateVisitorToken = (visitorId: string): string => {
  return jwt.sign(
    { visitorId },
    VISITOR_JWT_SECRET,
    { expiresIn: "1d" }
  );
};
