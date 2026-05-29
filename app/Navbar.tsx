'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const links = [
    { label: 'Marcadores', icon: '/icons/marcadores.png', href: '/' },
    { label: 'Sorteo', icon: '/icons/sorteo.png', href: '/sorteo' },
    { label: 'Posiciones', icon: '/icons/posiciones.png', href: '/posiciones' },
    { label: 'Goleador', icon: '/icons/goleador.png', href: '/goleador' },
    { label: 'Portero', icon: '/icons/portero.png', href: '/portero' },
  ]

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-[#1A2234]/90 backdrop-blur-xl border border-slate-700/50 rounded-[28px] flex justify-around items-center py-3 px-2 z-50">
      {links.map((item) => (
        <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 ${pathname === item.href ? 'text-[#34D399]' : 'text-zinc-500'}`}>
          <Image src={item.icon} alt={item.label} width={30} height={30} />
          <span className="text-[10px] font-semibold">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}