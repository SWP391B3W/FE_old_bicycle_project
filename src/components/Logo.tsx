import { Link } from 'react-router-dom'
import { BRAND } from '@/constants/brand'

interface LogoProps {
  readonly className?: string
  readonly textClassName?: string
  readonly showText?: boolean
  readonly asLink?: boolean
}

export default function Logo({
  className = '',
  textClassName = '',
  showText = true,
  asLink = false
}: LogoProps) {
  const content = (
    <>
      <img
        src={BRAND.logoPath}
        alt={BRAND.logoAlt}
        className={`h-11 w-11 rounded-2xl shadow-xl shadow-sky-900/15 object-cover ${className}`}
      />
      {showText && <span className={`text-lg font-semibold tracking-tight text-white ${textClassName}`}>{BRAND.name}</span>}
    </>
  )

  if (asLink) {
    return (
      <Link to="/" className="inline-flex items-center gap-3">
        {content}
      </Link>
    )
  }

  return (
    <div className="inline-flex items-center gap-3">
      {content}
    </div>
  )
}
