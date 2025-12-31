import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - SnipSeek",
  description: "Sign in to your SnipSeek account to access your code snippets and collections.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
