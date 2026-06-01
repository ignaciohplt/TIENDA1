import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetalTec | Corte laser industrial",
  description:
    "Tienda online de productos metalicos, corte laser en chapa, corte de canos, carteleria metalica y trabajos personalizados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
