export type MessageActionsProps = {
  message: string
  chatId?: string
  // Add other props like enableShare if needed later
}

export function MessageActions({ message, chatId }: MessageActionsProps) {
  // TODO: Implement actual actions (copy, share, etc.) using the props
  console.log('MessageActions props:', { message, chatId })
  return null; // placeholder for share/copy buttons
} 