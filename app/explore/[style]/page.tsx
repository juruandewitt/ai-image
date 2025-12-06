// app/explore/[style]/page.tsx
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

export default function StyleAliasPage({ params }: { params: { style: string } }) {
  // Redirect e.g. /explore/dali -> /explore/styles/dali
  redirect(`/explore/styles/${params.style}`)
}
