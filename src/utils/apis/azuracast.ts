import { Song } from "../types"
import discord from "./discord"

interface NowPlaying {
    title: string
    artist: string
    art: string
}

interface streamer {
    name: string
    art: string
}

interface Mounts {
    [key: number]: Mount
}

interface Mount {
    url: string
    bitrate: number
    format: string
}

interface StationStats {
    listeners: number
    is_live: boolean
    streamer: {
        name: string
        art: string
    }
    current_song: {
        title: string
        artist: string
    }
    next_song?: {
        title: string
        artist: string
    }
}

interface djAccount {
    id: number
    streamer_username: string
    streamer_password: string
    display_name: string
    comments: string | null
    is_active: boolean
    enforce_schedule: boolean
    reactivate_at: string | null
    schedule_items: string[]
}

interface djCreation {
    id?: number
    streamer_username?: string
    streamer_password?: string
    display_name?: string
    comments?: string | null
    is_active?: boolean
    enforce_schedule?: boolean
    reactivate_at?: string | null
    schedule_items?: string[]

    success: boolean
}

const Discord = new discord(process.env.DISCORD_BOT_TOKEN as string)

class Azuracast {
    public static async getNowPlaying(): Promise<NowPlaying> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()
            return {
                artist: data.now_playing.song.artist,
                title: data.now_playing.song.title,
                art: data.now_playing.song.art,
            }
        } catch {
            return {
                artist: "Unknown",
                title: "Unknown",
                art: "",
            }
        }
    }

    public static async getStreamer(): Promise<streamer> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()

            if (data.live.is_live) {
                const discordUser = await Discord.getUserData(data.live.streamer_name)
                if (!discordUser) return {
                    name: "Unknown",
                    art: "",
                }

                return {
                    name: discordUser.displayName,
                    art: discordUser.avatar,
                }
            } else {
                return {
                    name: process.env.AUTODJ_NAME as string,
                    art: process.env.AUTODJ_IMG as string,
                }
            }

        } catch {
            return {
                name: "Unknown",
                art: "",
            }
        }
    }

    public static async getListeners(): Promise<number> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()
            return data.listeners.unique
        } catch {
            return 0
        }
    }

    public static async getHls(): Promise<string | false> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()

            if (data.station.hls_enabled) {
                return data.station.hls_url
            } else {
                return false
            }
        } catch {
            return false
        }
    }

    public static async getMounts(): Promise<Mounts> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()

            let mounts: Mounts = {}

            for (const mount of data.station.mounts) {
                mounts[mount.id] = {
                    url: mount.url,
                    bitrate: mount.bitrate,
                    format: convertFileToHtmlType(mount.format),
                }
            }

            return mounts
        } catch {
            return {}
        }
    }

    public static async getStationStats(): Promise<StationStats> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/nowplaying/${process.env.AZURACAST_STATION_ID}`)
            const data = await response.json()
            
            let streamer = {
                name: process.env.AUTODJ_NAME as string,
                art: process.env.AUTODJ_IMG as string,
            }

            let current_song = {
                title: data.now_playing.song.title,
                artist: data.now_playing.song.artist,
            }

            let next_song = undefined

            if (data.playing_next?.song?.title && data.playing_next?.song?.artist && !data.live.is_live) {
                next_song = {
                    title: data.playing_next.song.title,
                    artist: data.playing_next.song.artist,
                }
            }

            if (data.live.is_live) {
                const discordUser = await Discord.getUserData(data.live.streamer_name)
                if (discordUser) {
                    streamer = {
                        name: discordUser.displayName,
                        art: discordUser.avatar,
                    }
                }
            }

            return {
                listeners: data.listeners.unique,
                is_live: data.live.is_live,
                streamer: streamer,
                current_song: current_song,
                next_song: next_song,
            }
        } catch {
            return {
                listeners: 0,
                is_live: false,
                streamer: {
                    name: "Unknown",
                    art: "",
                },
                current_song: {
                    title: "Unknown",
                    artist: "Unknown",
                },
                next_song: undefined,
            }
        }
    }

    public static async skipSong(): Promise<boolean> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/station/${process.env.AZURACAST_STATION_ID}/backend/skip`, {
                method: "POST",
                headers: {
                    "X-API-Key": process.env.AZURACAST_API_KEY as string,
                }
            })
            return response.ok
        } catch {
            return false
        }
    }

    public static async hasDjAccount(id: string): Promise<boolean> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/station/${process.env.AZURACAST_STATION_ID}/streamers`, {
                headers: {
                    "X-API-Key": process.env.AZURACAST_API_KEY as string,
                }
            })

            const data = await response.json()

            const filtered = data.filter((d: {display_name: string})=>{
                return d.display_name === id
            })

            if (filtered.length > 0) {
                return true
            } 
            
            return false
        } catch {
            return false
        }
    }

    public static async getDjAccount(id: string): Promise<djAccount | false> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/station/${process.env.AZURACAST_STATION_ID}/streamers`, {
                headers: {
                    "X-API-Key": process.env.AZURACAST_API_KEY as string,
                }
            })

            const data = await response.json()

            const filtered = data.filter((d: {display_name: string})=>{
                return d.display_name == id
            })

            return filtered[0]
        } catch {
            return false
        }
    }

    public static async createDjAccount(id: string, name: string): Promise<djCreation> {
        try {
            const password = generatePassword(16)
            const usernameSuffix = generateStr(7)

            const response = await fetch(`${process.env.AZURACAST_URL}/api/station/${process.env.AZURACAST_STATION_ID}/streamers`, {
                method: "POST",
                headers: {
                    "X-API-Key": process.env.AZURACAST_API_KEY as string,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: 0,
                    streamer_username: name + '-' + usernameSuffix, 
                    streamer_password: password,
                    display_name: id,
                    is_active: true,
                    enforce_schedule: false,
                    reactivate_at: null,
                    schedule_items: [],
                    comments: null,
                })
            })

            const data = await response.json()

            if (response.ok) {
                return {
                    ...data,
                    streamer_password: password,
                    success: true,
                }
            } else {
                return {
                    success: false,
                }
            }

        } catch {
            return {
                success: false,
            }
        }
    }

    public static async deleteDjAccount(id: number): Promise<boolean> {
        try {
            const response = await fetch(`${process.env.AZURACAST_URL}/api/station/${process.env.AZURACAST_STATION_ID}/streamer/${id}`, {
                method: "DELETE",
                headers: {
                    "X-API-Key": process.env.AZURACAST_API_KEY as string,
                }
            })

            return response.ok
        } catch (e) {
            console.log(e)
            return false
        }
    }
}

function convertFileToHtmlType(fileExt: string): string {
    switch (fileExt) {
        case "mp3":
            return "audio/mpeg"
        case "ogg":
            return "audio/ogg"
        case "flac":
            return "audio/flac"
        case "wav":
            return "audio/wav"
        case "m4a":
            return "audio/mp4"
        case "aac":
            return "audio/aac"
        case "webm":
            return "audio/webm"
        case "opus":
            return "audio/opus"
        default:
            return "audio/mpeg"
    }
}

const validChars = {
    num: "0123456789",
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
}

function generatePassword(len: number): string {
    let password = ""
    const chosenChars = validChars.num + validChars.lower + validChars.upper

    for (let i = 0; i < len; i++) {
        password += chosenChars.charAt(Math.floor(Math.random() * chosenChars.length))
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d{2}/.test(password)) {
        return generatePassword(len)
    }

    return password
}

function generateStr(len: number): string {
    const charset = validChars.lower + validChars.upper
    let str = ""

    for (let i = 0; i < len; i++) {
        str += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return str
}

export default Azuracast
export { Azuracast }
export type { NowPlaying, streamer, Mounts, Mount }