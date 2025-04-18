import { cn } from '@/lib/utils'
import { ChevronDown, UserCircle2 } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible' // Corrected path
import { IconLogo } from '../ui/icons' // Corrected path
import { Separator } from '../ui/separator' // Corrected path

interface CollapsibleMessageProps {
  children: React.ReactNode
  role: 'user' | 'assistant'
  isCollapsible?: boolean
  isOpen?: boolean
  header?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  showBorder?: boolean
  showIcon?: boolean
}

export function CollapsibleMessage({
  children,
  role,
  isCollapsible = false,
  isOpen = true,
  header,
  onOpenChange,
  showBorder = true,
  showIcon = true
}: CollapsibleMessageProps) {
  const content = <div className="py-2 flex-1">{children}</div>

  // Determine Icon based on role
  const IconComponent = role === 'user' ? UserCircle2 : IconLogo;
  const iconSize = role === 'user' ? 20 : undefined; // IconLogo might have its own size

  return (
    <div className="flex">
      {showIcon && (
        <div className="relative flex flex-col items-center mr-4"> {/* Added margin */} 
          <div className={cn('mt-[10px]', role === 'assistant' && 'mt-4')}> {/* Adjusted top margin slightly */} 
            <IconComponent size={iconSize} className={cn(role === 'user' ? "text-muted-foreground" : "size-5")} />
          </div>
        </div>
      )}

      {isCollapsible ? (
        <div
          className={cn(
            'flex-1 rounded-2xl p-4',
            showBorder && 'border border-border/50'
          )}
        >
          <Collapsible
            open={isOpen}
            onOpenChange={onOpenChange}
            className="w-full"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full group" disabled={!onOpenChange}> {/* Disable trigger if no handler */} 
              <div className="flex items-center justify-between w-full gap-2">
                {header && <div className="text-sm w-full">{header}</div>}
                {onOpenChange && <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />} {/* Only show chevron if collapsible */} 
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
              <Separator className="my-4 border-border/50" />
              {content}
            </CollapsibleContent>
          </Collapsible>
        </div>
      ) : (
        // Apply px-4 only when not collapsible to match original structure
        <div className={cn("flex-1 rounded-2xl", !showIcon && "px-4")}> 
            {content}
        </div>
      )}
    </div>
  )
} 