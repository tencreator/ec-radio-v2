"use client"
import { useEffect, useState } from "react"
import Filter from "./Filter"
import Card from "./Card"

interface resource {
    name: string
    tags: string[]
    url: string
}

export default function View() {
    const [resources, setResources] = useState<resource[]>([])
    const [list, setList] = useState<resource[]>([])
    const [filter, setFilter] = useState("")

    useEffect(()=>{
        if (filter === "") {
            setList(resources)
        } else {
            setList(resources.filter((resource) => resource.name.includes(filter)))
        }
    }, [resources, filter])

    useEffect(()=>{
        setResources([
            {name: "Resource 1", tags: ["tag1", "tag2"], url: "https://example.com"},
            {name: "Resource 2", tags: ["tag1", "tag2"], url: "https://example.com"},
            {name: "Resource 3", tags: ["tag1", "tag2"], url: "https://example.com"},
            {name: "Resource 4", tags: ["tag1", "tag2"], url: "https://example.com"},
            {name: "Resource 5", tags: ["tag1", "tag2"], url: "https://example.com"},
            {name: "Resource 6", tags: ["tag1", "tag2"], url: "https://example.com"},
        ])
    }, [])

    return (
        <div>
            <Filter setFilter={setFilter} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {list.map((resource) => <Card key={resource.name} resource={resource} />)}
            </div>
        </div>
    )
}