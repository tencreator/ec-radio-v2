"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ViewPolicies({id}: {id: number}) {
    const [loading, setLoading] = useState(true)
    const [policies, setPolicies] = useState<{id: number, name: string, text: string} | null>(null)

    useEffect(() => {
        fetch("/api/staff/policies/" + id)
            .then(res => res.json())
            .then(data => {
                setPolicies(data)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div className="mx-auto mt-4 lg:w-11/12">
            {JSON.stringify(policies)}
        </div>
    )
}