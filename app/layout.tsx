import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HungryBuds | Good food, delivered to your hostel",
    template: "%s | HungryBuds",
  },
  description: "Craving late-night snacks or campus meals? Order from your favourite local restaurants delivered right to your hostel. Fast, fresh, and reliable campus food delivery.",
  keywords: [
    "HungryBuds",
    "Hostel Food Delivery",
    "Campus Food",
    "Late Night Delivery",
    "Student Meals",
    "Food Delivery App",
  ],
  authors: [{ name: "HungryBuds" }],
  creator: "HungryBuds",
  publisher: "HungryBuds",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hungry-buds-updated.vercel.app"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "HungryBuds | Good food, delivered to your hostel",
    description: "Order from your favourite local restaurants and get your meal without leaving campus.",
    url: "https://hungry-buds-updated.vercel.app",
    siteName: "HungryBuds",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HungryBuds | Good food, delivered to your hostel",
    description: "Hostel food delivery made quick and simple.",
  },
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
