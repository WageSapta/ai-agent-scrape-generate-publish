import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Hotel Atelier — AI hotel story publisher",
    template: "%s · Hotel Atelier",
  },
  description:
    "An AI editorial agent that reads any hotel's official page, writes a feature story, renders a hero image, and publishes it to Dev.to every two hours.",
  openGraph: {
    title: "Hotel Atelier — AI hotel story publisher",
    description:
      "Scrape a hotel page. Compose an editorial feature. Render a hero image. Publish to Dev.to, every two hours.",
    type: "website",
    siteName: "Hotel Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotel Atelier — AI hotel story publisher",
    description:
      "Scrape a hotel page. Compose an editorial feature. Render a hero image. Publish to Dev.to, every two hours.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          closeButton
          toastOptions={{
            className: "font-sans",
            style: {
              background: "#0d0f12",
              border: "1px solid #23272d",
              color: "#f2ece1",
            },
          }}
        />
      </body>
    </html>
  );
}
