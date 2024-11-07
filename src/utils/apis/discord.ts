import Log from '@log'

interface DiscordUserData {
    nickname: string
    roles: string[]
}

class Discord {
    private token: string
    private log = new Log("Discord")

    constructor(token: string) {
        this.token = token
    }

    public async getUserData(userId: string, guildId: string): Promise<DiscordUserData> {
        try {
            const url = `https://discord.com/api/v9/guilds/${guildId}/members/${userId}`
            console.log(url)

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
                nickname: data.nick || data.user.username,
            }
        } catch (e: any) {
            this.log.error(["Failed to fetch user roles", e])
            return {
                roles: [],
                nickname: ""
            }
        }
    }
}

export default Discord
export { Discord }