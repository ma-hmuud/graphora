import type { SVGAttributes } from 'react'

const AuthBackgroundShape = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='800' height='800' viewBox='0 0 800 800' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer ambient glow */}
      <circle cx="400" cy="400" r="350" fill="url(#glow)" />

      {/* Network Edges (Connections) */}
      <g stroke="currentColor" className="text-primary/20" strokeWidth="1" strokeDasharray="3 3">
        <line x1="150" y1="200" x2="300" y2="120" />
        <line x1="300" y1="120" x2="500" y2="180" />
        <line x1="500" y1="180" x2="650" y2="300" />
        <line x1="650" y1="300" x2="580" y2="520" />
        <line x1="580" y1="520" x2="400" y2="680" />
        <line x1="400" y1="680" x2="220" y2="580" />
        <line x1="220" y1="580" x2="150" y2="200" />
        
        {/* Inner cross connections */}
        <line x1="300" y1="120" x2="400" y2="400" />
        <line x1="500" y1="180" x2="400" y2="400" />
        <line x1="650" y1="300" x2="400" y2="400" />
        <line x1="580" y1="520" x2="400" y2="400" />
        <line x1="220" y1="580" x2="400" y2="400" />
        <line x1="150" y1="200" x2="400" y2="400" />
      </g>

      {/* Outer Nodes */}
      <g fill="var(--primary)" opacity="0.3">
        <circle cx="150" cy="200" r="6" />
        <circle cx="300" cy="120" r="8" />
        <circle cx="500" cy="180" r="7" />
        <circle cx="650" cy="300" r="9" />
        <circle cx="580" cy="520" r="8" />
        <circle cx="400" cy="680" r="7" />
        <circle cx="220" cy="580" r="6" />
      </g>

      {/* Central Hub Node */}
      <circle cx="400" cy="400" r="14" fill="var(--primary)" opacity="0.5" className="animate-pulse" />
      <circle cx="400" cy="400" r="6" fill="var(--primary)" />
    </svg>
  )
}

export default AuthBackgroundShape

