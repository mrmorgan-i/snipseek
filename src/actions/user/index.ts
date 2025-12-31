"use server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeText } from "@/lib/utils";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validation";
import { eq } from "drizzle-orm";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, image } = parsed.data;
    const sanitizedName = sanitizeText(name);

    await db
      .update(user)
      .set({
        name: sanitizedName,
        image: image ?? null,
      })
      .where(eq(user.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function deleteAccount(): Promise<ActionResult> {
  try {
    const session = await requireAuth();

    await db.delete(user).where(eq(user.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
