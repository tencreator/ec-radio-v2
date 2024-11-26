import { headers, cookies } from 'next/headers'
import CreateButton from './CreateButton'
import DeleteButton from './DeleteButton'
import { CopyButton } from './CopyButton'

export default async function ViewDetails() {
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    async function getDetails() {
        const res = await fetch(url + '/api/staff/presenter/connection', {
            headers: {
                'Cookie': (await cookies()).toString()
            }
        })
        if (!res.ok) return
        const data = await res.json()
        return data
    }

    const details = await getDetails()

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
                    
                    <DeleteButton />
                </div>
            ) : (
                <>
                    <p>No connection details found.</p>
                    <CreateButton />
                </>
            )}
        </div>
    )
}

function CreateDetailText({title, text, hidden = false}: {title: string, text: string, hidden? : boolean}) { 
    return (
        <>
            <span className="font-semibold capitalize">{title}:</span> <span>{hidden ? '********' : text}</span> <CopyButton text={text} />
        </>
    )
}