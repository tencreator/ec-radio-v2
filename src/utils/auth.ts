import NextAuth, { type DefaultSession } from "next-auth"
import { JWT as defaultJWT } from "next-auth/jwt"
import Discord from "next-auth/providers/discord"
import DiscordAPI from "./apis/discord"

declare module 'next-auth' {
    interface Session {
        user: {
            providerId?: string
            displayName?: string
            avatarDecoration?: string | false
            nickname?: string | false
        } & DefaultSession['user']
    }
    interface JWT extends defaultJWT {
        providerId?: string
        displayName?: string
        avatarDecoration?: string
        nickname?: string
    }
}

const discord = new DiscordAPI(process.env.DISCORD_BOT_TOKEN as string)

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Discord({
        profile(profile) {
            return {
                ...profile,
                providerid: profile.id,
                image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
                avatarDecoration: profile.avatar_decoration_data?.asset ? `https://cdn.discordapp.com/avatar-decoration-presets/${profile.avatar_decoration_data?.asset}` || false : false
            }
        }
    })],
    callbacks: {
        jwt: async ({token, user}: {token: any, user: any}) => {
            if (user) {
                const userData = await discord.getUserGuildData(user.providerid as string, process.env.GUILD_ID as string)

                token.providerId = user.providerid
                token.displayName = user.global_name
                token.avatarDecoration = user.avatar_decoration_data?.asset ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data?.asset}` || false : false
                token.nickname = userData.nickname
            }
            return token
        },
        
        session: async ({session, token}) => {
            session.user.providerId = token.providerId as string
            session.user.displayName = token.displayName as string
            session.user.avatarDecoration = token.avatarDecoration as string
            session.user.nickname = token.nickname as string
            return session
        }
    },
    pages: {
        signIn: '/auth',
        signOut: '/auth',
    },
})