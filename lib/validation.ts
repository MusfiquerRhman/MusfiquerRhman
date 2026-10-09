import { z } from "zod";

export const contactSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Please add a title of at least 3 characters.")
    .max(150),
  email: z.email("Please enter a valid email address.").max(254),
  message: z
    .string()
    .trim()
    .min(10, "Please write a message of at least 10 characters.")
    .max(10000),
  website: z.string().max(200).optional().default(""),
});

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(256),
});

export const postSchema = z.object({
  title: z.string().trim().min(3).max(150),
  slug: z
    .string()
    .min(1)
    .max(180)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens for the URL.",
    ),
  excerpt: z
    .string()
    .trim()
    .min(10, "Add a short description of at least 10 characters.")
    .max(300),
  content: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters.")
    .max(100000),
  tags: z.array(z.string().trim().min(1).max(30)).max(8),
  published: z.boolean(),
});
