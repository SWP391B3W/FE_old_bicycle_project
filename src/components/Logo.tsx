import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  textClassName?: string
  showText?: boolean
}

export default function Logo({ className = '', textClassName = '', showText = true }: LogoProps) {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <img 
        src="/logo.jpg" 
        alt="Market Bike Logo" 
        className={`h-11 w-11 rounded-2xl shadow-xl shadow-sky-900/15 object-cover ${className}`}
      />
      {showText && <span className={`text-lg font-semibold tracking-tight text-white ${textClassName}`}>Market Bike</span>}
    </Link>
  )
}
