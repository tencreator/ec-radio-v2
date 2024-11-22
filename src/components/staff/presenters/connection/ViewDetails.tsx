"use client"
import { useState, useEffect } from 'react'
import CreateButton from './CreateButton'
import DeleteButton from './DeleteButton'

export default function ViewDetails() {
    const [details, setDetails] = useState<null | {azuraid: string, discordid: string, name: string, password: string}>(null)
    const [loading, setLoading] = useState(true)

    async function getDetails() {
        const res = await fetch('/api/staff/presenter/connection')
        if (!res.ok) return
        const data = await res.json()
        setDetails(data)
        setLoading(false)
    }

    useEffect(() => {
        getDetails()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            {details ? (
                <div className='flex flex-col align-start'>
                    
                    <p className="text-lg font-semibold">Connection Details:</p>
                    <div className='grid grid-cols-2 sm:grid-cols-3 w-fit'>
                        <CreateDetailText title="Username" text={details.name} />
                        <CreateDetailText title="Password" text={details.password} hidden={true} />
                        <CreateDetailText title="Host" text="radio.emeraldcoastrp.com" /> 
                        <CreateDetailText title="Port" text="8005" />
                        <CreateDetailText title="Mount" text="/" />                   
                    </div>
                    
                    <DeleteButton setDetails={setDetails} />
                </div>
            ) : (
                <>
                    <p>No connection details found.</p>
                    <CreateButton getDetails={getDetails} setDetails={setDetails} />
                </>
            )}
        </div>
    )
}

function CreateDetailText({title, text, hidden = false}: {title: string, text: string, hidden? : boolean}) {
    function copyText() {
        navigator.clipboard.writeText(text)
    }
    
    return (
        <>
            <span className="font-semibold capitalize">{title}:</span> <span>{hidden ? '********' : text}</span> <button className='w-fit ml-4 hidden sm:block' onClick={copyText}><i className='fa-solid fa-clipboard'></i></button>
        </>
    )
}