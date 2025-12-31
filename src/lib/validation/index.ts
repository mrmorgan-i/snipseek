import { z } from "zod";

// supported programming languages
export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "scala",
  "r",
  "sql",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "markdown",
  "bash",
  "shell",
  "powershell",
  "dockerfile",
  "graphql",
  "prisma",
  "toml",
  "xml",
  "plaintext",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// collection schemas
export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(100, "Collection name must be 100 characters or less")
    .trim(),
});

export const updateCollectionSchema = z.object({
  id: z.string().min(1, "Collection ID is required"),
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(100, "Collection name must be 100 characters or less")
    .trim(),
});

export const deleteCollectionSchema = z.object({
  id: z.string().min(1, "Collection ID is required"),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type DeleteCollectionInput = z.infer<typeof deleteCollectionSchema>;

// snippet schemas
export const createSnippetSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .trim()
    .optional()
    .nullable(),
  code: z
    .string()
    .min(1, "Code is required")
    .max(10000, "Code must be 10,000 characters or less"),
  language: z.enum(SUPPORTED_LANGUAGES, {
    message: "Please select a valid programming language",
  }),
  tags: z
    .array(
      z
        .string()
        .min(1)
        .max(30, "Each tag must be 30 characters or less")
        .trim()
    )
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .nullable(),
  collectionId: z.string().min(1, "Collection is required"),
  isPublic: z.boolean().default(false),
});

export const updateSnippetSchema = z.object({
  id: z.string().min(1, "Snippet ID is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .trim()
    .optional()
    .nullable(),
  code: z
    .string()
    .min(1, "Code is required")
    .max(10000, "Code must be 10,000 characters or less"),
  language: z.enum(SUPPORTED_LANGUAGES, {
    message: "Please select a valid programming language",
  }),
  tags: z
    .array(
      z
        .string()
        .min(1)
        .max(30, "Each tag must be 30 characters or less")
        .trim()
    )
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .nullable(),
  collectionId: z.string().min(1, "Collection is required"),
  isPublic: z.boolean().default(false),
});

export const deleteSnippetSchema = z.object({
  id: z.string().min(1, "Snippet ID is required"),
});

export const toggleSnippetVisibilitySchema = z.object({
  id: z.string().min(1, "Snippet ID is required"),
  isPublic: z.boolean(),
});

export const moveSnippetSchema = z.object({
  id: z.string().min(1, "Snippet ID is required"),
  collectionId: z.string().min(1, "Collection is required"),
});

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
export type DeleteSnippetInput = z.infer<typeof deleteSnippetSchema>;
export type ToggleSnippetVisibilityInput = z.infer<typeof toggleSnippetVisibilitySchema>;
export type MoveSnippetInput = z.infer<typeof moveSnippetSchema>;

// search schemas
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(500).trim(),
  mode: z.enum(["text", "semantic"]).default("text"),
  language: z.enum(SUPPORTED_LANGUAGES).optional().nullable(),
  collectionId: z.string().optional().nullable(),
  isPublic: z.boolean().optional().nullable(),
});

export type SearchInput = z.infer<typeof searchSchema>;

// user profile schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  image: z.string().url("Invalid image URL").optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
