
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import visitorAuthRoutes from "./routes/visitorAuthRoutes.js";

import aboutRoutes from "./routes/aboutRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio CMS API is running!",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/visitor-auth", visitorAuthRoutes);

app.use("/api/about", aboutRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/messages", messageRoutes);

export default app;
