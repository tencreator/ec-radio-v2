"use client"
import { useEffect, useState } from "react"
import Filter from "./Filter"
import Card from "./Card"
import { RefreshButton } from "@/components/utils/RefreshButton"

interface resource {
    name: string
    tags: string[]
    url: string
}

export default function View() {
    const [resources, setResources] = useState<resource[]>([])
    const [list, setList] = useState<resource[]>([])
    const [filter, setFilter] = useState("")
    const [loading, setLoading] = useState(true)

    async function getResources() {
        const response = await fetch("/api/staff/presenter/resources")
    
        if (!response.ok) {
            console.error("Failed to fetch resources")
            return
        }
    
        const data = await response.json()

        setResources(data)
        setLoading(false)
    }

    useEffect(()=>{
        if (filter === "") {
            setList(resources)
        } else {
            setList(resources.filter((resource) => {
                return resource.name.toLowerCase().includes(filter.toLowerCase()) || resource.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase()))
            }))
        }
    }, [resources, filter])


    useEffect(()=>{
        getResources()
        setInterval(getResources, 2500)
    }, [])

    if (loading) return (
        <p>Loading...</p>
    )

    return (
        <div>
            <div className="flex flex-row items-center">
                <Filter setFilter={setFilter} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {list.length === 0 && <p>No resources found</p>}
                {list.map((resource, i) => <Card key={i} resource={resource} />)}
            </div>
        </div>
    )
}