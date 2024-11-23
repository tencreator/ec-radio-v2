import Log from '@log'
import Caching from '../cache'

interface DiscordGuildUserData {
    nickname: string | false
    roles: string[]
}

interface DiscordUserData {
    displayName: string
    avatar: string
}

class Discord {
    private token: string
    private log = new Log("Discord")
    private cache = new Caching()

    constructor(token: string) {
        this.token = token
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
}

export default Discord
export { Discord }