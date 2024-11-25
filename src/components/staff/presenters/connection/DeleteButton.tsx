"use client"
import { useRouter } from "next/navigation"

export default function DeleteButton() {
    const router = useRouter()

    async function deleteConnectionDetails(){
        const res = await fetch(`/api/staff/presenter/connection`, {
            method: 'DELETE',
        })

        if (!res.ok) return

        router.refresh()
    }

    return (
        <button className="btn btn-primary w-fit mt-4" onClick={deleteConnectionDetails}>Delete Connection Details</button>
    )
}