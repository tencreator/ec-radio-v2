"use client"
import { useRouter } from "next/navigation"

export const RefreshButton = () => {
  const router = useRouter()

  return (
    <button className="btn btn-sm btn-error" onClick={() => router.refresh()}>Refresh</button>
  )
}