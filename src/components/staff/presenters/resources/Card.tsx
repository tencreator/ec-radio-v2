import { createRef, useEffect, useState } from "react"

interface resource {
    name: string
    tags: string[]
    url: string
}

export default function Card({resource}: {resource: resource}) {
    const [playing, setPlaying] = useState(false)
    const audioRef = createRef<HTMLAudioElement>()

    useEffect(()=>{
        if (playing) {
            audioRef.current?.play()
        } else {
            audioRef.current?.pause()
        }
    }, [playing])

    useEffect(()=>{
        audioRef.current?.load()
    }, [resource])

    return (
        <div className="card bg-base-200 border border-solid border-base-300 p-6">
            <div className="card-body p-6">
                <div className="card-title">
                    <h3 className="capitalize">{resource.name}</h3>
                    <div className="grow"></div>
                    {resource.tags.map((tag) => <span key={tag} className="badge badge-accent capitalize">{tag}</span>)}
                </div>
            </div>
            <div className="card-actions justify-end flex flex-row gap-4">
                <button className="btn btn-primary">Download</button>
                <button className="btn btn-secondary" onClick={()=>setPlaying(!playing)}>{playing ? 'Stop Playing' : 'Play'}</button>
            </div>

            <audio src={resource.url} controls={playing} ref={audioRef} />
        </div>
    )
}