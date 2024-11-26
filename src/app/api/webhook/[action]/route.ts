import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import Discord from "@/utils/apis/discord"
import Spotify from "@/utils/apis/spotify"

const prisma = new PrismaClient()
const discord = new Discord(process.env.DISCORD_BOT_TOKEN as string)
const spotify = new Spotify(process.env.SPOTIFY_CLIENT_ID as string, process.env.SPOTIFY_CLIENT_SECRET as string)

const actions: { [key: string]: (req: NextRequest) => Promise<NextResponse> } = {
    songChange,
    djConenct,
    djDisconnect,
    listenerChange
}

export async function POST(request: NextRequest, {params} : {params : Promise<{action: string}>}): Promise<NextResponse> {
    const { action } = await params
    console.log(params)
    
    try {
        if (!isAuthed(request)) return new NextResponse('Unauthorized', { status: 401 })
    
        if (!action || !actions[action]) return new NextResponse('Not Found', { status: 404 })
        return actions[action](request)
    } catch {
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

async function songChange(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json()
        const rawSongData = {
            title: body.now_playing.song.title,
            artist: body.now_playing.song.artist,
            art: body.now_playing.song.art
        }
    
        const song = await spotify.searchExtensive(rawSongData.title, rawSongData.artist)
        const songData = song ? {
            title: song.title,
            artist: song.artist,
            art: song.art,
            spotify: song.url,
            explicit: song.explicit,
            album: song.album
        } : rawSongData
    
        const channelId = await prisma.webhookChannels.findFirst({
            select: {
                songchanged: true
            }
        })
    
        if (channelId) {
            discord.sendToChannel(channelId?.songchanged, {
                embeds: [
                    {
                        title: 'Now Playing',
                        author: {
                            name: `🎵 ${songData.title} - ${songData.artist}`,
                            icon_url: songData.art
                        },
                        fields: [
                            {
                                name: 'Title',
                                value: songData.title,
                                inline: true
                            },
                            {
                                name: 'Artist',
                                value: songData.artist,
                                inline: true
                            },
                            {
                                name: 'Album',
                                value: 'album' in songData ? songData.album : 'Not available',
                                inline: true
                            },
                            {
                                name: 'Explicit',
                                value: 'explicit' in songData ? songData.explicit ? 'Yes' : 'No' : 'Not available',
                                inline: true
                            },
                            {
                                name: 'Streamer',
                                value: body.live.is_live ? body.live.streamer_name : process.env.AUTODJ_NAME as string,
                                inline: true
                            },
                            {
                                name: 'Listeners',
                                value: body.listeners.unique,
                                inline: true
                            }  
                        ],
                        footer: {
                            text: 'spotify' in songData && songData.spotify ?  'Listen on Spotify' : 'Not available on Spotify'
                        },
                        url: 'spotify' in songData && songData.spotify ? songData.spotify : undefined
                    }
                ]
            })
        }
    
        await prisma.songLogs.create({
            data: {
                title: songData.title,
                artist: songData.artist,
                art: songData.art,
                streamer: body.live.is_live ? body.live.streamer_name : process.env.AUTODJ_NAME as string,
                listeners: body.listeners.unique,
                explicit: 'explicit' in songData ? songData.explicit : false,
                album: 'album' in songData ? songData.album : 'N/A',
                date: new Date()
            }
        })
    
        return new NextResponse('OK')
    } catch {
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

async function djConenct(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json()
        const channelId = await prisma.webhookChannels.findFirst({
            select: {
                djConnected: true
            }
        })
    
        if (channelId) {
            const user = await discord.getUserData(body.live.streamer_name)
    
            discord.sendToChannel(channelId?.djConnected, {
                embeds: [
                    {
                        title: 'DJ Connected',
                        // description: `${body.dj.name} has connected to the stream.`,
                        fields: [
                            {
                                name: 'User ID',
                                value: body.live.streamer_name,
                                inline: true
                            },
                            {
                                name: 'User Name',
                                value: user ? user.displayName : 'Unknown',
                                inline: true
                            },
                            {
                                name: 'Ping',
                                value: `<@${body.live.streamer_name}>`,
                                inline: true
                            },
                            {
                                name: 'Listeners',
                                value: body.listeners.unique,
                                inline: true
                            }
                        ],
                        color: 0x00ff00
                    }
                ]
            })
        }
    
        await prisma.connectionLogs.create({
            data: {
                userid: body.live.streamer_name,
                date: new Date(),
                action: 'connected'
            }
        })
    
        return new NextResponse('OK')
    } catch {
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

async function djDisconnect(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json()
        const channelId = await prisma.webhookChannels.findFirst({
            select: {
                djDisconnected: true
            }
        })
    
        if (channelId) {
            const user = await discord.getUserData(body.live.streamer_name)
    
            discord.sendToChannel(channelId?.djDisconnected, {
                embeds: [
                    {
                        title: 'DJ Disconnected',
                        fields: [
                            {
                                name: 'Listeners',
                                value: body.listeners.unique,
                                inline: true
                            }
                        ],
                        color: 0xff0000
                    }
                ]
            })
        }
    
        await prisma.connectionLogs.create({
            data: {
                userid: body.live.streamer_name,
                date: new Date(),
                action: 'disconnected'
            }
        })
    
        return new NextResponse('OK')
    } catch {
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

async function listenerChange(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json()
        const channelId = await prisma.webhookChannels.findFirst({
            select: {
                listenerStats: true
            }
        })

        const date = new Date().toISOString().split('T')[0]
        const listenerStats = await prisma.listenerStats.findFirst({
            where: {
                date: date
            }
        })
    
        if (listenerStats) {
            const minListeners = listenerStats.minListeners > body.listeners.unique ? body.listeners.unique : listenerStats.minListeners
            const maxListeners = listenerStats.maxListeners < body.listeners.unique ? body.listeners.unique : listenerStats.maxListeners
            const avgListeners = (listenerStats.avgListeners + body.listeners.unique) / 2

            if (channelId) {
                if (listenerStats.minListeners > minListeners) {
                    discord.sendToChannel(channelId.listenerStats, {
                        embeds: [
                            {
                                title: 'New Minimum Listeners',
                                description: `New minimum listeners for today is ${body.listeners.unique}`,
                                color: 0x00ff00
                            }
                        ]
                    })
                }

                if (listenerStats.maxListeners < maxListeners) {
                    discord.sendToChannel(channelId.listenerStats, {
                        embeds: [
                            {
                                title: 'New Maximum Listeners',
                                description: `New maximum listeners for today is ${body.listeners.unique}`,
                                color: 0xff0000
                            }
                        ]
                    })
                }
            }

            await prisma.listenerStats.update({
                where: {
                    id: listenerStats.id
                },
                data: {
                    minListeners: minListeners,
                    maxListeners: maxListeners,
                    avgListeners: avgListeners,
                }
            })
        } else {
            if (channelId) {
                discord.sendToChannel(channelId.listenerStats, {
                    embeds: [
                        {
                            title: 'New Day',
                            description: 'New day, new stats!',
                            fields: [
                                {
                                    name: 'Current Listeners',
                                    value: body.listeners.unique,
                                }
                            ],
                            color: 0x0000ff
                        }
                    ]
                })
            }

            await prisma.listenerStats.create({
                data: {
                    date: date,
                    minListeners: body.listeners.unique,
                    maxListeners: body.listeners.unique,
                    avgListeners: body.listeners.unique,
                }
            })
        }
    
        return new NextResponse('OK')
    } catch {
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

function isAuthed(req: NextRequest): boolean {
    const authDetails = req.headers.get('Authorization')
    if (authDetails && authDetails.startsWith('Basic ')) {
        const base64Credentials = authDetails.split(' ')[1]
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
        const [username, password] = credentials.split(':')
        const [WEBHOOK_USER, WEBHOOK_PASS] = (process.env.WEBHOOK_AUTH as string).split(':')
        return username === WEBHOOK_USER && password === WEBHOOK_PASS
    }

    return false
}