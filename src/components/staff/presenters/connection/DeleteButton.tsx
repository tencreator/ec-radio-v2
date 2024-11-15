"use client"

interface props {
    setDetails: (details: any) => void
}

export default function DeleteButton({ setDetails }: props) {
    async function deleteConnectionDetails(){
        const res = await fetch(`/api/staff/presenter/connection`, {
            method: 'DELETE',
        })

        if (!res.ok) return
        setDetails(null)
    }

    return (
        <button className="btn btn-primary" onClick={deleteConnectionDetails}>Delete Connection Details</button>
    )
}