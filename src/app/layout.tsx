import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next";

import '@/styles/globals.css'
import '@/styles/fa.css'
import Header from "@/components/header";
import Viewer from '@/components/audio/viewer'

export const metadata: Metadata = {
  title: "Emerald Coast Radio",
  description: "A basic radio player for Emerald Coast RP coded by TenCreator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="dracula" lang="en">
      <link rel="icon" href={'https://cdn.emeraldcoastrp.com/elogo64x64.png'} />
      <link rel="apple-touch-icon" href={'https://cdn.emeraldcoastrp.com/elogo64x64.png'} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>  
      <body className="min-h-screen max-w-screen flex flex-col">
        <Analytics />
        <SpeedInsights />
        <Viewer />
        <Header />
        {children}
      </body>
    </html>
  );
}
