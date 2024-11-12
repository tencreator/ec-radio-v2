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
        <div className="mt-4 lg:w-11/12">
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {policies && policies.map((policy, i) => (
                    <li key={i}>
                        <Link className="btn bg-base-300 border border-solid border-base-300 justify-start w-full font-semibold text-xl" href={`/staff/policies/${policy.id}`}>{policy.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}