import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import TanStackQueryProvider from "@/provider/TanstackQueryProvider";
import { Toaster } from "sonner";
// import { AdminLayout } from "@/components/core/layout/AdminLayout";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: true,
  variable: "--font-ubuntu",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4001"
  ),
  title: "Tascape",
  description:
    "Effortlessly organize, manage, and track your tasks with Tascape. Stay productive and never miss a deadline.",
  keywords: [
    "task manager",
    "to-do list",
    "productivity",
    "organization",
    "task tracking",
    "project management",
  ],
  openGraph: {
    title: "Tascape",
    description:
      "Effortlessly organize, manage, and track your tasks with Tascape. Stay productive and never miss a deadline.",
    type: "website",
    url: "https://tascape.com",
    images: [
      {
        url: "/logo/logo.svg",
        width: 1200,
        height: 630,
        alt: "Tascape Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ubuntu.variable}>
      <body className={`${ubuntu.className} antialiased`}>
        <TanStackQueryProvider>{children}</TanStackQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
