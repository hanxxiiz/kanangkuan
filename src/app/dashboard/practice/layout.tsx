import PracticeLayout from '@/components/dashboard/practice/PracticeLayout'

export default function PracticeModesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PracticeLayout>{children}</PracticeLayout>
}