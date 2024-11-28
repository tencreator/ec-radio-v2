import Log from '@log'
import Caching from '../cache'
import { PrismaClient } from '@prisma/client'
import { LogChannels } from './db'

interface DiscordGuildUserData {
    nickname: string | false
    roles: string[]
}

interface DiscordUserData {
    displayName: string
    avatar: string
}

interface RoleData {
    id: string
    name: string
    color: string
}

class Discord {
    private token: string
    private log = new Log("Discord")
    private cache = new Caching()
    private prisma = new PrismaClient()

    constructor(token?: string) {
        this.token = token || process.env.DISCORD_BOT_TOKEN as string
    }

    public async getUserGuildData(userId: string, guildId: string): Promise<DiscordGuildUserData> {
        try {
            const url = `https://discord.com/api/v9/guilds/${guildId}/members/${userId}`

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bot ${this.token}`,
                    'Content-Type': 'application/json'
                }
            })
    
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message)
            }

            return {
                roles: data.roles,
                nickname: data.nick || false,
            }
        } catch (e: any) {
            this.log.error(["Failed to fetch user roles", e])
            return {
                roles: [],
                nickname: false
            }
        }
    }

    public async getRoleData(roleId: string): Promise<RoleData> {
        if (this.cache.has(roleId)) {
            return this.cache.get(roleId)
        }

        try {
            const url = `https://discord.com/api/v9/guilds/${process.env.GUILD_ID}/roles/${roleId}`

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bot ${this.token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message)
            }

            this.cache.set(roleId, {
                id: data.id,
                name: data.name,
                color: data.color
            }, 300)

            return {
                id: data.id,
                name: data.name,
                color: data.color
            }
        } catch {
            return {
                id: "0",
                name: "Unknown",
                color: "0"
            }
        }
    }

    public async getUserData(userId: string): Promise<DiscordUserData | false> {
        if (this.cache.has(userId)) {
            return this.cache.get(userId)
        }

        try {
            const url = `https://discord.com/api/v9/users/${userId}`

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bot ${this.token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message)
            }

            const avatar = data.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${Number(userId) % 5}.png`

            this.cache.set(userId, {
                displayName: data.username,
                avatar: avatar
            }, 300)

            return {
                displayName: data.username,
                avatar: avatar
            }
        } catch {
            return false
        }
    }

    public async sendToWebhook(url: string, data: any): Promise<boolean> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error("Failed to send webhook")
            }

            return true
        } catch {
            return false
        }
    }

    public async sendToChannel(channelId: string, data: any): Promise<boolean> {
        try {
            const url = `https://discord.com/api/v9/channels/${channelId}/messages`

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bot ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error("Failed to send message")
            }

            return true
        } catch {
            return false
        }
    }

    public async sendLog(logName: LogChannels, embed: any): Promise<boolean> {
        try {
            const channelId: any = await this.prisma.webhookChannels.findFirst({
                select: {
                    [logName]: true
                }
            }) as any

            console.log(channelId)

            if (!channelId || typeof channelId[logName] !== "string") {
                throw new Error("Channel not found")
            }

            const newData = {
                embeds: [{
                    ...embed,
                    footer: {
                        text: "Coded by TenCreator"
                    },
                    timestamp: new Date().toISOString()
                }]
            }


            const res = await this.sendToChannel(channelId[logName] as string, newData)
            console.log(res)
            return res
        } catch (e) {
            console.log(e)
            return false
        }
    }
}

export default Discord
export { Discord }