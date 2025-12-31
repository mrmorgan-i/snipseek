"use server";

import { db } from "@/lib/db";
import { collection } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { generateId, sanitizeText } from "@/lib/utils";
import {
  createCollectionSchema,
  type CreateCollectionInput,
} from "@/lib/validation";

type ActionResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export async function createCollection(
  input: CreateCollectionInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = createCollectionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name } = parsed.data;
    const sanitizedName = sanitizeText(name);

    const id = generateId();

    await db.insert(collection).values({
      id,
      userId: session.user.id,
      name: sanitizedName,
      isDefault: false,
    });

    return { success: true, data: { id } };
  } catch (error) {
    console.error("Failed to create collection:", error);

    // handle unique constraint violation
    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return {
        success: false,
        error: "A collection with this name already exists",
      };
    }

    return { success: false, error: "Failed to create collection" };
  }
}
