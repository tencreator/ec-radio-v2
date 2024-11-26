import { NextRequest, NextResponse } from "next/server";
import { Azuracast } from "@/utils/apis/azuracast";
import { auth } from "@/utils/auth";
import { Permissions, hasPermission } from "@/utils/permissions";
import { PrismaClient } from "@prisma/client";
import Caching from "@/utils/cache";
import Discord from "@/utils/apis/discord";

const prisma = new PrismaClient()
const cache = new Caching()
const discord = new Discord(process.env.DISCORD_BOT_TOKEN as string)

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        const all = req.nextUrl.searchParams.get("all") === "true"
        
        if (!all) {
            if (!await hasPermission(session.user.providerId, Permissions.SELF_CONNECTION)) {
                return new NextResponse("Forbidden", {status: 403})
            }
    
            if (cache.has(`djaccount-${session.user.providerId}`)) {
                return new NextResponse(cache.get(`djaccount-${session.user.providerId}`), {headers: {"content-type": "application/json"}})
            }
    
            const hasAccount = await Azuracast.hasDjAccount(session.user.providerId as string)
            if (!hasAccount) return new NextResponse("Not Found", {status: 404})
    
            const account = await prisma.djaccounts.findFirst({
                where: {
                    discordid: session.user.providerId as string
                }
            })
            if (!account) return new NextResponse("Not Found", {status: 404})
    
            cache.set(`djaccount-${session.user.providerId}`, JSON.stringify(account), 300)
    
            return new NextResponse(JSON.stringify(account), {status: 200})
        } else {
            if (!await hasPermission(session.user.providerId, Permissions.MANAGE_CONNECTIONS)) {
                return new NextResponse("Forbidden", {status: 403})
            }

            if (cache.has("djaccounts")) {
                return new NextResponse(cache.get("djaccounts"), {headers: {"content-type": "application/json"}})
            }

            const dbRes = await prisma.djaccounts.findMany()

            const accounts = await Promise.all(dbRes.map(async (account) => {
                const user = await discord.getUserData(account.discordid)

                return {
                    id: account.id,
                    azuraid: account.azuraid,
                    discordid: account.discordid,
                    name: account.name,
                    user: {
                        id: account.discordid,
                        displayName: user ? user.displayName : "Unknown (Copy ID)",
                        avatar: user ? user.avatar : ""
                    }
                }
            }))

            cache.set("djaccounts", JSON.stringify(accounts), 300)

            return new NextResponse(JSON.stringify(accounts), {status: 200})
        }

    } catch (e) {
        return new NextResponse("Internal Server Error", {status: 500})
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        const id = req.nextUrl.searchParams.get("id")

        if (!id) {
            if (!await hasPermission(session.user.providerId, Permissions.SELF_CONNECTION)) {
                return new NextResponse("Forbidden", {status: 403})
            }
    
            const hasAccount = await Azuracast.hasDjAccount(session.user.providerId as string)
            if (hasAccount) return new NextResponse("Conflict", {status: 409})
    
            const res = await Azuracast.createDjAccount(session.user.providerId as string, session.user.displayName as string)
            if (!res.success) return new NextResponse("Internal Server Error", {status: 500})
    
            if (!res.id || !session.user.providerId || !res.streamer_username || !res.streamer_password) return new NextResponse("Internal Server Error, Account created.", {status: 500})
    
            const res2 = await prisma.djaccounts.create({
                data: {
                    azuraid: res.id.toString(),
                    discordid: session.user.providerId as string,
                    name: res.streamer_username,
                    password: res.streamer_password
                }
            })
    
            cache.delete(`djaccount-${session.user.providerId}`)
    
            return new NextResponse(JSON.stringify(res2), {status: 200})
        } else {
            if (!await hasPermission(session.user.providerId, Permissions.MANAGE_CONNECTIONS)) {
                return new NextResponse("Forbidden", {status: 403})
            }

            const account = await prisma.djaccounts.findFirst({
                where: {
                    id: parseInt(id)
                }
            })
            if (!account) return new NextResponse("Not Found", {status: 404})

            const res = await Azuracast.deleteDjAccount(parseInt(account.azuraid))
            if (!res) return new NextResponse("Internal Server Error", {status: 500})

            await prisma.djaccounts.delete({
                where: {
                    id: parseInt(id)
                }
            })

            cache.delete("djaccounts")
            cache.delete(`djaccount-${account.discordid}`)

            return new NextResponse("OK", {status: 200})
        }

    } catch (e) {
        return new NextResponse("Internal Server Error", {status: 500})
    }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        if (!await hasPermission(session.user.providerId, Permissions.SELF_CONNECTION)) {
            return new NextResponse("Forbidden", {status: 403})
        }

        const hasAccount = await Azuracast.hasDjAccount(session.user.providerId as string)
        if (!hasAccount) return new NextResponse("Not Found", {status: 404})

        const account = await Azuracast.getDjAccount(session.user.providerId as string)
        if (!account || !account.id) return new NextResponse("Internal Server Error", {status: 500})

        const res = await Azuracast.deleteDjAccount(account.id)
        if (!res) return new NextResponse("Internal Server Error", {status: 500})

        await prisma.djaccounts.deleteMany({
            where: {
                azuraid: account.id.toString()
            }
        })

        cache.delete(`djaccount-${session.user.providerId}`)

        return new NextResponse("OK", {status: 200})
    } catch (e) {
        return new NextResponse("Internal Server Error", {status: 500})
    }
}