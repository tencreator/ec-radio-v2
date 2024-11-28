"use client"
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'
import { useRouter } from "next/navigation"

export default function ViewPolicy({policy}: {policy: {id: number, name: string, text: string}}) {
    const router = useRouter()
    const [text, setText] = useState(policy.text)
    const [title, setTitle] = useState(policy.name)

    async function submit() {
        await fetch(`/api/staff/policies/${policy.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: title, text})
        })

        router.push('/staff/director/policies')
    }

    return (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2">
            <div>
                <div className="flex flex-row gap-4">
                    <input type="text" value={title} onChange={(e)=>setTitle(e.currentTarget.value)} className='input input-sm mb-4 bg-base-200' />
                    <button className='btn btn-primary btn-sm' onClick={submit}>Submit</button>
                </div>
                <textarea className='w-11/12 max-h-full textarea bg-base-200 overflow-auto' value={text} onChange={(e)=>{setText(e.currentTarget.value)}}></textarea>
            </div>
            <div className="markdown overflow-auto">
                <h2 className='mb-4'>{title}</h2>
                <ReactMarkdown>{text}</ReactMarkdown>
            </div>
        </div>
    )
}

export function Skeleton() {
    return (
        <div className="mt-4">
            <div className="markdown flex flex-row gap-2">
                <div className="w-full h-[2ch] skeleton"></div>
                <div className="w-full h-[2ch] skeleton"></div>
                <div className="w-full h-[2ch] skeleton"></div>
                <div className="w-full h-[2ch] skeleton"></div>
            </div>
        </div>
    )
}