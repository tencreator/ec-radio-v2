"use client"
import { useEffect, useState } from "react"
import RequestBtn from "./RequestBtn"

interface Props {
    filter: string
}

interface request {
    id: string
    name: string
    date: string
    message: string
}

const thClasses = 'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'

export default function RequestsTable({ filter }: Props): JSX.Element {
    const [requests, setRequests] = useState<request[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    async function getRequests(filter?: string) {
        try {
            const endpoint = '/api/requests' + (filter ? `?filter=${filter}` : '')
            const res = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) return

            const data = await res.json()
    
            setRequests(data.requests)
            setLoading(false)
        } catch (e){
            console.error(e)
        }
    }

    useEffect(()=>{
        getRequests(filter)

        setInterval(async ()=>{
            await getRequests(filter)
        }, 30 * 1000)
    }, [])

    return (
        <div className="border-2 border-base-300 rounded-md mt-4 bg-base-200 w-screen md:w-full">
            <div className="relative max-w-full overflow-auto">
                <table className={"w-full table-auto caption-bottom text-sm border-collapse border-base-300" + (loading ? 'hidden' : '')}>
                    <thead className='[&_tr]:border-b border-collapse border-base-300'>
                        <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                            <th className={thClasses}>Name</th>
                            <th className={thClasses}>Date</th>
                            <th className={thClasses}>Message</th>
                            <th className={thClasses}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='[&_tr:last-child]:border-0 border-base-300'>
                        {requests && requests.length !== 0 ? requests.map((request: request, i: number) => (
                            <tr className='border-b transition-colors hover:bg-base-200 data-[state=selected]:bg-muted border-base-300 h-12' key={i}>
                                <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{request.name}</td>
                                <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{formatDate(request.date)}</td>
                                <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{request.message}</td>
                                <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>
                                    <div>
                                        <RequestBtn action='accept' requestId={request.id} filter={filter} updateRequests={getRequests} />
                                        <RequestBtn action='deny' requestId={request.id} filter={filter} updateRequests={getRequests} />
                                    </div>
                                </td>
                            </tr>
                        )): (
                            <tr className='hover'>
                                <td colSpan={4} className='p-4 align-middle text-center [&:has([role=checkbox])]:pr-0 h-12'>No requests found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function formatDate(date: string): string {
    return new Date(date).toLocaleString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short'
    })
}