'use client'

// ssr: false must live in a Client Component (Next.js 16 requirement)
import dynamic from 'next/dynamic'

const ChairViewer = dynamic(() => import('@/components/ChairViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#eceae6]">
      <p className="text-sm uppercase tracking-[6px] text-stone-400">Cargando modelo…</p>
    </div>
  ),
})

export default function SillaPage() {
  return <ChairViewer />
}
