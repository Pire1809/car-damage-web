import "./globals.css";

export const metadata = {
  title: "Car Damage AI",
  description: "Vehicle Damage Detection using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}