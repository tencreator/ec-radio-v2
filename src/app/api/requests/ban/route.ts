import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { hasPermission, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"
import Caching from "@/utils/cache"

const prisma = new PrismaClient()
const cache = new Caching()

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!await hasPermission(session.user.providerId, Permissions.BAN_IP) || !await hasPermission(session.user.providerId, Permissions.UNBAN_IP)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const ip = req.nextUrl.searchParams.get("ip")

        if (ip) {
            if (cache.has(ip)) {
                return new NextResponse(JSON.stringify({ banned: cache.get(ip) }), { status: 200, headers: { 'Content-Type': 'application/json' } })
            }

            const banned = await prisma.bannedReqIps.findMany({
                where: {
                    ip: ip
                },
                select: {
                    id: true,
                    ip: true,
                    banned: true,
                    bannedBy: true,
                    bannedAt: true,
                }
            })

            cache.set(ip, banned, 300)

            return new NextResponse(JSON.stringify({ banned: banned }), { status: 200, headers: { 'Content-Type': 'application/json' } })
        } else {
            if (cache.has("all")) {
                return new NextResponse(JSON.stringify({ banned: cache.get("all") }), { status: 200, headers: { 'Content-Type': 'application/json' } })
            }

            const banned = await prisma.bannedReqIps.findMany({
                select: {
                    id: true,
                    ip: true,
                    banned: true,
                    bannedBy: true,
                    bannedAt: true,
                }
            })

            cache.set("all", banned, 15)

            return new NextResponse(JSON.stringify({ banned: banned }), { status: 200, headers: { 'Content-Type': 'application/json' } })
        }

    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!await hasPermission(session.user.providerId, Permissions.BAN_IP)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const ip = req.nextUrl.searchParams.get("ip")

        if (!ip) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        const isBanned = await prisma.bannedReqIps.findFirst({
            where: {
                ip: ip
            }
        })

        if (isBanned) {
            return new NextResponse("Already banned", { status: 400 })
        }

        const banned = await prisma.bannedReqIps.create({
            data: {
                ip: ip,
                banned: true,
                bannedBy: session.user.providerId as string,
                bannedAt: new Date()
            }
        })


        cache.set(ip, banned, 300)
        cache.clear()

        return new NextResponse(JSON.stringify({ banned: banned }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (e: any) {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!await hasPermission(session.user.providerId, Permissions.UNBAN_IP)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const ip = req.nextUrl.searchParams.get("ip")

        if (!ip) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        const isBanned = await prisma.bannedReqIps.findFirst({
            where: {
                ip: ip
            }
        })

        if (!isBanned) {
            return new NextResponse("Not banned", { status: 400 })
        }

        await prisma.bannedReqIps.deleteMany({
            where: {
                ip: ip
            }
        })

        if (cache.has(ip)) {
            cache.delete(ip)
        }
        cache.clear()

        return new NextResponse("Deleted", { status: 200 })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}