"use client"

interface props {
    getDetails: () => void,
    setDetails: (details: any) => void
}

export default function CreateButton({ getDetails, setDetails }: props){
    async function generateConnectionDetails(){
        const res = await fetch(`/api/staff/presenter/connection`, {
            method: 'POST',
        })

        if (!res.ok) return
        const data = await res.json()
        setDetails(data)
    } 

    return (
        <button className="btn btn-primary w-fit mt-4" onClick={generateConnectionDetails}>Generate Connection Details</button>
    )
}