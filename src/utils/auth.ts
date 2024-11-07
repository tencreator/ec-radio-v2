import NextAuth, { type DefaultSession } from "next-auth"
import { JWT as defaultJWT } from "next-auth/jwt"
import Discord from "next-auth/providers/discord"

import DiscordAPI from "./apis/discord"

declare module 'next-auth' {
    interface Session {
        user: {
            providerId?: string
            perms?: string[]
            displayName?: string
            avatarDecoration?: string
            nickname?: string
        } & DefaultSession['user']
    }
    interface JWT extends defaultJWT {
        providerId?: string
        perms?: string[]
        displayName?: string
        avatarDecoration?: string
        nickname?: string
    }
}

const discord = new DiscordAPI(process.env.DISCORD_BOT_TOKEN as string)

async function flattenPerms(perms: string[][]) {
    return perms.reduce((acc, val) => acc.concat(val), [])
}

async function getRolePerms(roles: string[]) {

}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Discord({
        profile(profile) {
            return {
                ...profile,
                providerid: profile.id,
            }
        }
    })],
    callbacks: {
        jwt: async ({token, user}: {token: any, user: any}) => {
            if (user) {
                const userData = await discord.getUserData(user.providerid as string, process.env.GUILD_ID as string)

                token.providerId = user.providerid
                token.displayName = user.global_name
                token.avatarDecoration = user.avatar_decoration_data?.asset ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data?.asset}` || "" : ""
                token.perms = userData.roles
                token.nickname = userData.nickname
            }
            return token
        },
        
        session: async ({session, token}) => {
            session.user.providerId = token.providerId as string
            session.user.perms = token.perms as string[]
            session.user.displayName = token.displayName as string
            session.user.avatarDecoration = token.avatarDecoration as string
            session.user.nickname = token.nickname as string
            return session
        }
    }
})