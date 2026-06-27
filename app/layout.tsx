import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetaliaDesing | Diseño metálico para espacios únicos",
  description:
    "Productos de diseño para hogares, locales y espacios comerciales. Paneles decorativos, carteles, cuadros, separadores y piezas metálicas listas para usar.",
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
