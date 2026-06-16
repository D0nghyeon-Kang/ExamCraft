import './globals.css'

export const metadata = {
  title: 'ExamCraft',
  description: 'Generate CSAT-style English questions automatically from any passage.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
