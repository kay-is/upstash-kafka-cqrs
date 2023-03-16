export const metadata = {
  title: "CQRS with Next & Upstash",
  description: "CQRS and event-sourcing built with Upstash services.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
