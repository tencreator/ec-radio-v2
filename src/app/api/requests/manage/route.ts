import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { hasPermissionSync, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"

/// <reference types="./next-env.d.ts" />

const prisma = new PrismaClient()

export async function POST(req: NextRequest): Promise<NextResponse> {
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
                processedBy: session.user.providerId
            }
        })

        return new NextResponse(JSON.stringify({ok: true, message: "Successfully Managed Request"}), { status: 200 })
    } catch (e: any) {
        return new NextResponse(JSON.stringify({message: "Internal Server Error", error: JSON.stringify(e), ok: false}), { status: 500 })
    }
}