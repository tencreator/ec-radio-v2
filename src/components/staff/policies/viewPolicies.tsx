"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ViewPolicies() {
    const [loading, setLoading] = useState(true)
    const [policies, setPolicies] = useState<{id: number, name: string}[] | null>(null)

    useEffect(() => {
        fetch("/api/staff/policies")
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
            <ul>
                {policies && policies.map((policy, i) => (
                    <li key={i}>
                        <Link className="btn btn-primary" href={`/staff/policies/${policy.id}`}>{policy.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}