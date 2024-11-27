"use client"
import { useRouter } from "next/navigation"

export default function DeleteButton({id}: {id: string}) {
    const router = useRouter()
    async function deletePerm() {
        await fetch('/api/staff/director/permissions', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id})
        })

        router.refresh()
    }

    return (
        <button className="btn btn-primary btn-sm" onClick={deletePerm}>Delete</button>
    )
}