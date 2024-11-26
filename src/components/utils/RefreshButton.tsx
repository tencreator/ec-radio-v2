"use client"
import { useRouter } from "next/navigation"

export const RefreshButton = ({ className }: { className?: string }) => {
  const router = useRouter()

  return (
    <button className={(className || '') + " btn btn-sm btn-error"} onClick={() => router.refresh()}>Refresh</button>
  )
}