import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import * as React from "react";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CEFER",
  description: "Centro de Educação Física, Esportes e Recreação",
};

export default function RootLayout({ children }) {
  return (
    <html lang="br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppRouterCacheProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
