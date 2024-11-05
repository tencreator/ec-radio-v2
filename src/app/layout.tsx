import type { Metadata } from "next";
import { Head } from "next/document";

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
      <body>
        <Header />
        {children}
        <Viewer />
      </body>
    </html>
  );
}
