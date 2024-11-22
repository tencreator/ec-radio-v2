"use client"
import { createRef, use, useEffect, useState } from "react"

interface resource {
    name: string
    tags: string[]
    url: string
}

export default function Card({resource}: {resource: resource}) {
    const [playing, setPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
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

        audioRef.current.onloadedmetadata = () => {
            if (!audioRef.current) return
            setDuration(Math.round(audioRef.current.duration))
        }
    }, [audioRef.current])

    return (
        <div className="card bg-base-200 border border-solid border-base-300 p-6">
            <div className="card-body p-6">
                <div className="card-title flex-col items-start">
                    <div className="flex flex-row gap-2">
                        {resource.tags.map((tag) => <span key={tag} className="badge badge-accent badge-sm capitalize">{tag}</span>)}
                    </div>
                    <h3 className="capitalize">{resource.name}</h3>
                </div>
                <p>Duration: {duration}s</p>
            </div>
            <div className="card-actions justify-end flex flex-row gap-4">
                <button className="btn btn-primary">Download</button>
                <button className="btn btn-secondary" onClick={()=>setPlaying(!playing)}>{playing ? 'Stop Playing' : 'Play'}</button>
            </div>

            <audio src={resource.url} ref={audioRef} hidden />
        </div>
    )
}