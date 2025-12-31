import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - SnipSeek",
  description: "Create your free SnipSeek account to start organizing and searching your code snippets.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
