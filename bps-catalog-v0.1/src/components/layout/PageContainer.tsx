import type { ReactNode } from 'react'

export function PageContainer({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-6 ${className}`}>
      {children}
    </div>
  )
}
