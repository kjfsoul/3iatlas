import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

export const metadata = {
  title: "3I/Atlas",
  description: "Live drops from four Printify outposts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
