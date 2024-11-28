"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function WebhookChannels({
    data,
    edit
}: {
    data: {
        id: string,
        songchanged: string,
        listenerStats: string,
        djConnected: string,
        djDisconnected: string,
        stationDown: string,
        stationUp: string,
        request: string,
        requestProcessed: string,
        timetableLog: string,
        bannedReqIp: string,
        settingsChanged: string,
        permissionsChanged: string,
        policyChanged: string,
        connectionLogs: string,
        resourcesChanged: string,
    },
    edit: boolean
}) {
    const router = useRouter()
    const [webhookChannels, setWebhookChannels] = useState<{
        songchanged: string,
        listenerStats: string,
        djConnected: string,
        djDisconnected: string,
        stationDown: string,
        stationUp: string,
        request: string,
        requestProcessed: string,
        timetableLog: string,
        bannedReqIp: string,
        settingsChanged: string,
        permissionsChanged: string,
        policyChanged: string,
        connectionLogs: string,
        resourcesChanged: string,
    }>(data)
    
    const [status, setStatus] = useState({status: false, display: false, message: 'Test'})

    async function updateField(field: string, value: string) {
        setWebhookChannels({
            ...webhookChannels,
            [field]: value
        })
    }

    async function saveChanges() {
        const res = await fetch(`/api/staff/director/settings/webhookChannels`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: data.id,
                ...webhookChannels
            })
        })

        if (res.ok) {
            setStatus({
                status: true,
                display: true,
                message: 'Changes saved successfully'
            })
        } else {
            setStatus({
                status: false,
                display: true,
                message: 'Failed to save changes'
            })
        }
        
        router.refresh()
    }

    useEffect(()=>{
        const timer = setTimeout(() => {
            setStatus({
                ...status,
                display: false
            })
        }, 5000)

        return () => clearTimeout(timer)
    })

    return (
        <div className="flex flex-col gap-4">
            <h2 className="font-bold text-xl">Webhook Channels</h2>
            { status.display && <div className={`alert ${status.status ? 'alert-success' : 'alert-error'}`}>
                {status.status ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )} {status.message}
            </div> }
            {edit && <button className="btn btn-primary btn-sm w-fit" onClick={saveChanges}>Edit</button>}
                <WebhookItem label="Song Changed" value={webhookChannels.songchanged} edit={edit} onChange={value => updateField('songchanged', value)} />
                <WebhookItem label="Listener Stats" value={webhookChannels.listenerStats} edit={edit} onChange={value => updateField('listenerStats', value)} />
                <WebhookItem label="DJ Connected" value={webhookChannels.djConnected} edit={edit} onChange={value => updateField('djConnected', value)} />
                <WebhookItem label="DJ Disconnected" value={webhookChannels.djDisconnected} edit={edit} onChange={value => updateField('djDisconnected', value)} />
                <WebhookItem label="Station Down" value={webhookChannels.stationDown} edit={edit} onChange={value => updateField('stationDown', value)} />
                <WebhookItem label="Station Up" value={webhookChannels.stationUp} edit={edit} onChange={value => updateField('stationUp', value)} />
                <WebhookItem label="Request" value={webhookChannels.request} edit={edit} onChange={value => updateField('request', value)} />
                <WebhookItem label="Request Processed" value={webhookChannels.requestProcessed} edit={edit} onChange={value => updateField('requestProcessed', value)} />
                <WebhookItem label="Timetable Log" value={webhookChannels.timetableLog} edit={edit} onChange={value => updateField('timetableLog', value)} />
                <WebhookItem label="Banned Request IP" value={webhookChannels.bannedReqIp} edit={edit} onChange={value => updateField('bannedReqIp', value)} />
                <WebhookItem label="Settings Changed" value={webhookChannels.settingsChanged} edit={edit} onChange={value => updateField('settingsChanged', value)} />
                <WebhookItem label="Permissions Changed" value={webhookChannels.permissionsChanged} edit={edit} onChange={value => updateField('permissionsChanged', value)} />
                <WebhookItem label="Policy Changed" value={webhookChannels.policyChanged} edit={edit} onChange={value => updateField('policyChanged', value)} />
                <WebhookItem label="Connection Logs" value={webhookChannels.connectionLogs} edit={edit} onChange={value => updateField('connectionLogs', value)} />
                <WebhookItem label="Resources Changed" value={webhookChannels.resourcesChanged} edit={edit} onChange={value => updateField('resourcesChanged', value)} />
        </div>
    )
}

function WebhookItem({ label, value, edit, onChange }: { label: string, value: string, edit: boolean, onChange: (value: string) => void }) {
    return (
        <div className="flex flex-col">
            <label htmlFor={label}>{label}</label>
            <input className="input input-sm bg-base-200" type="text" id={label} value={value} disabled={!edit} onChange={e => onChange(e.target.value)} />
        </div>
    )
}