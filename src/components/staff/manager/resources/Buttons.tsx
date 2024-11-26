"use client"
import { useEffect, useState, createRef } from 'react'
import { useRouter } from "next/navigation"

export function DeleteButton({id}: {id: string}) {
    const router = useRouter()

    async function deleteResource() {
        await fetch(`/api/staff/presenter/resources`, {
            method: 'DELETE',
            body: JSON.stringify({id})
        })

        router.refresh()
    }

    return (
        <button className="btn btn-error btn-sm" onClick={deleteResource}>Delete</button>
    )
}

export function EditButton({id, data}: {id: string, data: {name: string, url: string, tags: string[]}}) {
    const router = useRouter()
    const modal = createRef<HTMLDialogElement>()
    const [isOpen, setOpen] = useState(false)
    const [resourceData, setResourceData] = useState(data)

    async function submit() {
        await fetch('/api/staff/presenter/resources', {
            method: 'PUT',
            body: JSON.stringify(resourceData)
        })

        setOpen(false)
        router.refresh()
    }

    useEffect(()=>{
        if (!modal.current) return

        if (isOpen) {
            modal.current.showModal()
        } else {
            modal.current.close()
        }

        modal.current.onclose = ()=>{
            setOpen(false)
        }
    }, [isOpen])

    return (
        <div className="modal-container">
            <button className="btn btn-primary btn-sm" onClick={()=>setOpen(true)}>Edit</button>

            <dialog ref={modal} className="modal">
                <div className="modal-box flex flex-col">
                    <h2 className="modal-title font-xl font-semibold">Edit the resource</h2>
        
                    <div className="modal-action">
                        <form className="flex flex-col w-full" method="dialog">
                            <div className="flex flex-col space-between">
                                <label>Name</label>
                                <input type="text" className="input bg-base-200" value={resourceData.name} onChange={(e)=>setResourceData({...resourceData, name: e.target.value})} />
                            </div>
                            <div className="flex flex-col space-between">
                                <label>URL</label>
                                <input type="text" className="input bg-base-200" value={resourceData.url} onChange={(e)=>{
                                    if (!e.target.value.startsWith('http') || !e.target.value.startsWith('https')) e.target.style.border = '1px solid red'
                                    else e.target.style.border = 'none'
                                    setResourceData({...resourceData, url: e.target.value})
                                }} />
                            </div>
                            <div className="flex flex-col space-between">
                                <label>Tags (seperated by a comma</label>
                                <input type="text" className="input bg-base-200" value={resourceData.tags.join(', ')} onChange={(e)=>setResourceData({...resourceData, tags: e.target.value.split(',')})} />
                            </div>
                            
                            <div className="ml-auto flex flex-row mt-4 gap-4">
                                <button className="btn btn-primary" onClick={submit}>Submit</button>
                                <button className="btn btn-error" onClick={()=>{
                                    setOpen(false)
                                }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    )
}

export function PreviewButton({url}: {url: string}) {
    const [playing, setPlaying] = useState(false)
    const audioRef = createRef<HTMLAudioElement>()

    useEffect(()=>{
        if (!audioRef.current) return
        console.log(playing)

        if (playing) {
            audioRef.current.play()
        } else {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
    }, [playing])

    useEffect(()=>{
        if (!audioRef.current) return
        audioRef.current.onended = () => setPlaying(false)
    }, [audioRef.current])

    return (
        <>
            <audio ref={audioRef} hidden src={url} />
            <button className="btn btn-secondary btn-sm" onClick={()=>setPlaying(!playing)}>{playing ? 'Stop Playing' : 'Play'}</button>
        </>
    )
}