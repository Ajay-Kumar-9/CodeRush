import { Metadata } from "next";
import { Outfit } from "next/font/google"; 
import "./globals.css"; 
import { Toaster } from "react-hot-toast";

// Import Outfit Regular (400)
const outfit = Outfit({
  variable: "--font-outfit", 
  subsets: ["latin"], 
  weight: "400", 
});

export const metadata: Metadata = {
  title: "CODERUSH",
  description: "Realtime collaboration webApp",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        {/* Toast notifications */}
        <Toaster position="top-right" reverseOrder={false} />
        {children} {/* Render page content */}
      </body>
    </html>
  );
}
