"use client"
import { useState, useEffect } from 'react'
import CreateButton from './CreateButton'
import DeleteButton from './DeleteButton'

export default function ViewDetails() {
    const [details, setDetails] = useState<null | {azuraid: string, discordid: string, name: string, password: string}>(null)

    async function getDetails() {
        const res = await fetch('/api/staff/presenter/connection')
        if (!res.ok) return
        const data = await res.json()
        setDetails(data)
    }

    useEffect(() => {
        getDetails()
    }, [])

    return (
        <div>
            {details ? (
                <div className='flex flex-col align-start'>
                    
                    <p className="text-lg font-semibold">Connection Details:</p>
                    <CreateDetailText title="Username" text={details.name} />
                    <CreateDetailText title="Password" text={details.password} hidden={true} />
                    <CreateDetailText title="Host" text="radio.emeraldcoastrp.com" /> 
                    <CreateDetailText title="Port" text="8005" />
                    <CreateDetailText title="Mount" text="/" />                   
                    
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
        <div>
            <p><span className="font-semibold capitalize">{title}:</span> {hidden ? '********' : text} <button onClick={copyText}><i className='fa-solid fa-clipboard'></i></button></p>
        </div>
    )
}