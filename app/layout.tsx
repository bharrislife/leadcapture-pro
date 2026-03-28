export const metadata = {
  title: 'LeadCapture Pro',
  description: 'Trade show lead capture for Asian exhibitors',
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