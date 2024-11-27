"use client"
import { useRouter } from "next/navigation"

export default function DeleteButton({id} : {id: string}) {
    const router = useRouter()

    async function deletePolicy() {
        await fetch(`/api/staff/policies/${id}`, {
            method: 'DELETE'
        })

        router.refresh()
    }

    return (
        <button onClick={deletePolicy} className="btn btn-error btn-sm">Delete</button>
    )
}