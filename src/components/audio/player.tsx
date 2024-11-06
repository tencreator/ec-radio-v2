"use client"
import { useEffect, useRef } from 'react'

function AudioPlayer({audio, playing, volume, setPlaying, setVolume}: {
    audio: {
        url: string,
        format: string
        bitrate: number
    }[],
    playing: boolean,
    volume: number,
    setPlaying: (playing: boolean) => void,
    setVolume: (volume: number) => void
}): JSX.Element {
    const audioRef = useRef<HTMLAudioElement>(null)

    function changeVolume(key: string, volume: number, setVolume: (volume: number) => void): void {
        if (key === 'ArrowUp') {
            setVolume(Math.min(100, volume + 5))
        } else if (key === 'ArrowDown') {
            setVolume(Math.max(0, volume - 5))
        }
    }
    
    async function reloadAudio(audioRef: React.MutableRefObject<HTMLAudioElement | null>, playing: boolean): Promise<void> {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.load()
    
            audioRef.current.oncanplay = () => {
                if (!audioRef.current) return
                if (playing) {
                    audioRef.current.play()
                } else {
                    audioRef.current.pause()
                }
            }
        }
    }

    useEffect(() => {
        if (!audioRef.current) return

        reloadAudio(audioRef, playing)

        addEventListener('keypress', (e)=> {
            if (e.code === 'Space') {
                e.preventDefault()
                setPlaying(!playing)
            }
        })

        return () => {
            removeEventListener('keypress', (e) => {
                if (e.code === 'Space') {
                    e.preventDefault()
                    setPlaying(!playing)
                }
            })
        }
    }, [playing])

    useEffect(() => {
        if (!audioRef.current) return

        audioRef.current.volume = volume / 100

        addEventListener('keydown', (e) => {
            changeVolume(e.key, volume, setVolume)
        })

        return () => {
            removeEventListener('keydown', (e) => {
                changeVolume(e.key, volume, setVolume)
            })
        }
    }, [volume])

    return (
        <audio hidden ref={audioRef} id="audioPlayer">
            {audio.map((source, index) => (
                <source key={index} src={source.url} type={source.format} />
            ))}
        </audio>
    )
}

export default AudioPlayer
export { AudioPlayer }