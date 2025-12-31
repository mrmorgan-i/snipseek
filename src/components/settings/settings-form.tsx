"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, User, Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadButton } from "@/lib/uploadthing";
import { updateProfile } from "@/actions/user";
import type { SessionUser } from "@/lib/auth/session";

type SettingsFormProps = {
  user: SessionUser;
};

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateProfile({
        name: name.trim(),
        image,
      });

      if (result.success) {
        toast.success("Profile updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const hasChanges = name.trim() !== user.name || image !== user.image;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={image ?? undefined} alt={name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Profile Photo</p>
              <UploadButton
                endpoint="profileImage"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.ufsUrl) {
                    setImage(res[0].ufsUrl);
                    toast.success("Photo uploaded");
                  }
                }}
                onUploadError={(error) => {
                  toast.error(`Upload failed: ${error.message}`);
                }}
                appearance={{
                  button:
                    "cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm px-3 py-1.5 h-auto",
                  allowedContent: "hidden",
                }}
                content={{
                  button: (
                    <span className="cursor-pointer flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Upload Photo
                    </span>
                  ),
                }}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 4MB.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This is the name displayed on your profile and snippets.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 rounded-md border bg-muted text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email is managed by your OAuth provider and cannot be changed.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !hasChanges}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
