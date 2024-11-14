import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { hasPermissionSync, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"

const prisma = new PrismaClient()
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

        const requests = await prisma.requests.findMany({
            where: {
                pending: getAll ? undefined : true,
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
            },
            orderBy: {
                date: "desc",
            },
        })

        return new NextResponse(JSON.stringify({ requests: requests }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch {
        return new NextResponse(null, { status: 500 })
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        let body
        try {
            body = await req.formData()
        } catch (e) {
            console.error("Invalid JSON:", e)
            return new NextResponse("Invalid JSON", { status: 400 })
        }

        const reqType = body.get("reqType") as string
        const name = body.get("name") as string
        const message = body.get("message") as string

        console.log(reqType, name, message)
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