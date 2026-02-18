import type { Metadata } from "next";
import "./globals.css";
import Menu from '@/components/Menu/menu';
import Chat from '@/components/Chat/chat';
//import Counter from '@/components/counter/counter'
import {
  Gravitas_One,
  Manrope,
  Playfair_Display,
} from "next/font/google";

const gravitas = Gravitas_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gravitas",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "FOODZILLA",
  description: "Taste & Transformer",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${gravitas.variable}
          ${manrope.variable}
          ${playfair.variable}
        `}
      >
        {/* Loading Counter sits on top */}
        
        <Menu />
        {children}
        <Chat />
      </body>
    </html>
  );
}