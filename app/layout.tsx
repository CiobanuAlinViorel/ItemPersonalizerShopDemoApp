import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next"


export const metadata: Metadata = {
  title: "Item Customizer",
  description: "Everything can be customzied by you",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body
        className={` antialiased bg-beige-light`}
      >
        <Header />
        {children}
        <SpeedInsights />
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
