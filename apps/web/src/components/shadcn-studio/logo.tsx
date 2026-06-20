import { Network } from 'lucide-react'

// Util Imports
import { cn } from '@graphora/ui/lib/utils'

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
        <Network className="w-5 h-5 text-on-primary" />
      </div>
      <span className='text-xl font-bold tracking-wide text-foreground'>Graphora</span>
    </div>
  )
}

export default Logo

