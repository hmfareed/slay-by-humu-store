import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import SmoothScroll from "../components/SmoothScroll";
import SlideOutCart from "../components/SlideOutCart";
import BottomNav from "../components/BottomNav";
import { NotificationProvider } from "../src/context/NotificationContext";
import { AuthProvider } from "../src/context/AuthContext";
import Toaster from "../components/Toaster";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Slay by Humu - Luxury Storefront",
  description: "Curated excellence crafted for those who demand the finest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-full flex flex-col bg-brand-bg text-brand-text transition-colors duration-500`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NotificationProvider>
            <AuthProvider>
              <SmoothScroll>
                {children}
                <SlideOutCart />
                <BottomNav />
              </SmoothScroll>
            </AuthProvider>
            <Toaster />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
