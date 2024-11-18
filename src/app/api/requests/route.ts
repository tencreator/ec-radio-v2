import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { hasPermissionSync, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"
import Discord from "@/utils/apis/discord"

const prisma = new PrismaClient()
const discord = new Discord(process.env.DISCORD_BOT_TOKEN as string)
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const user = await auth()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!hasPermissionSync(user, Permissions.VIEW_REQUESTS)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        let getAll = ((req.nextUrl.searchParams.get("all") === "true" ? true : false) && hasPermissionSync(user, Permissions.MANAGE_REQUESTS)) ? true : false
        const filter = req.nextUrl.searchParams.get("filter")
        const limit = Number(req.nextUrl.searchParams.get("limit")) || 10
        const start = Number(req.nextUrl.searchParams.get("start")) || 0

        const dbRes = await prisma.requests.findMany({
            where: {
                pending: getAll ? undefined : true,
                type: filter ? filter : undefined,
            },
            select: {
                id: true,
                type: true,
                name: true,
                message: true,
                date: true,
                pending: true,
                accepted: true,
                ip: getAll ? true : false,
                processedBy: getAll ? true : false,
                processedAt: getAll ? true : false,
            },
            take: limit,
            skip: start,
            orderBy: {
                date: "asc",
            },
        })

        const requests = await Promise.all(dbRes.map(async (r) => {
            let ret: any = {
                ...r,
            }

            if (getAll) {
                const userId = r.processedBy
                if (userId) {
                    const user = await discord.getUserData(userId)
                    ret.user = user
                }
            }

            return ret
        }))

        return new NextResponse(JSON.stringify({ requests: await requests }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (e: any) {
        return new NextResponse(JSON.stringify({error: e}), { status: 500 })
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const requestsOpen = fetch('/api/requests/status')
        .then(res => res.json())
        .then(data => data.acceptingRequests)
        .catch(() => false)

    if (!requestsOpen) {
        return new NextResponse("Requests are closed", { status: 403 })
    }

    try {
        let body, reqType, name, message
        try {
            body = await req.json()
            reqType = body.reqType
            name = body.name
            message = body.message
        } catch (e) {
            try {
                body = await req.formData()
                reqType = body.get("type")
                name = body.get("name")
                message = body.get("message")
            } catch (e) {
                return new NextResponse("Invalid request", { status: 400 })
            }
        }

        const date = new Date()

        if (!reqType || !name || !message) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        const ip =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-real-ip") ||
            req.headers.get("x-client-ip") ||
            req.headers.get("x-cluster-client-ip") ||
            req.headers.get("forwarded") ||
            req.headers.get("remote-addr") ||
            req.headers.get("client-ip") ||
            req.headers.get("fastly-client-ip") ||
            req.headers.get("akamai-origin-hop") ||
            req.headers.get("true-client-ip") ||
            req.headers.get("x-remote-ip") ||
            req.headers.get("x-originating-ip") ||
            req.headers.get("x-host") ||
            req.headers.get("x-client-ips")

        if (!ip) {
            return new NextResponse("IP address not found", { status: 400 })
        }

        const banned = await prisma.bannedReqIps.findFirst({
            where: {
                ip: ip,
            },
        })

        if (banned && banned.banned) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await prisma.requests.create({
            data: {
                type: reqType,
                name: name,
                message: message,
                ip: ip,
                date: date,
            },
        })

        return new NextResponse("Success", { status: 200 })
    } catch (e) {
        console.error(e)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!hasPermissionSync(session, Permissions.ACCEPT_REQUESTS)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        let body, id, action
        try {
            body = await req.json()
            id = body.id
            action = body.action
        } catch {
            try {
                body = await req.formData()
                id = body.get('id')
                action = body.get('action')
            } catch{
                return new NextResponse("Bad Request", { status: 400 })
            }
        }

        if (!id || !action) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        const request = await prisma.requests.findUnique({
            where: {
                id: id
            }
        })

        if (!request) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (action !== 'accept' && action !== 'deny') {
            return new NextResponse("Bad Request", { status: 400 })
        }

        await prisma.requests.update({
            where: {
                id: id
            },
            data: {
                pending: false,
                accepted: action === 'accept',
                processedBy: session.user.providerId,
                processedAt: new Date()
            }
        })

        return new NextResponse(JSON.stringify({ok: true, message: "Successfully Managed Request"}), { status: 200 })
    } catch (e: any) {
        return new NextResponse(JSON.stringify({message: "Internal Server Error", error: JSON.stringify(e), ok: false}), { status: 500 })
    }
}