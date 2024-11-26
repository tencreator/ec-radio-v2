"use client"
import { useRouter } from "next/navigation"

export default function RevokeButton({ id }: { id: string }) {
    const router = useRouter()

    async function revoke() {
        await fetch(`/api/staff/presenter/connection?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        router.refresh()
    }

    return (
        <button className="bg-red-500 text-white rounded-md p-2" onClick={revoke}>Revoke</button>
    )
}