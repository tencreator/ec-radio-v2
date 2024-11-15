import Log from '@log'

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

            return {
                displayName: data.username,
                avatar: avatar
            }
        } catch {
            return false
        }
    }
}

export default Discord
export { Discord }