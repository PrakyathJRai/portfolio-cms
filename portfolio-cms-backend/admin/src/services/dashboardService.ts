
import api from "./api";

export interface DashboardStats {
  projects: number;
  skills: number;
  blogs: number;
  experience: number;
  testimonials: number;
  services: number;
  messages: number;
  media: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [
    projects,
    skills,
    blogs,
    experience,
    testimonials,
    services,
    messages,
    media,
  ] = await Promise.all([
    api.get("/projects"),
    api.get("/skills"),
    api.get("/blogs"),
    api.get("/experience"),
    api.get("/testimonials"),
    api.get("/services"),
    api.get("/messages"),
    api.get("/media"),
  ]);

  return {
    projects: projects.data.count,
    skills: skills.data.count,
    blogs: blogs.data.count,
    experience: experience.data.count,
    testimonials: testimonials.data.count,
    services: services.data.count,
    messages: messages.data.count,
    media: media.data.count,
  };
};
