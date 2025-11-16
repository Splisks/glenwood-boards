// app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css"; // optional if you want a global css
import { Providers } from "./providers";

export const metadata = {
  title: "Glenwood Boards",
  description: "Menu boards admin and screens"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
