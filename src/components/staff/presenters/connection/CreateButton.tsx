"use client"
import { useRouter } from "next/navigation"

export default function CreateButton(){
    const router = useRouter()

    async function generateConnectionDetails(){
        const res = await fetch(`/api/staff/presenter/connection`, {
            method: 'POST',
        })

        if (!res.ok) return

        router.refresh()
    } 

    return (
        <button className="btn btn-primary w-fit mt-4" onClick={generateConnectionDetails}>Generate Connection Details</button>
    )
}