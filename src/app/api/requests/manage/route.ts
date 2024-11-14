import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { hasPermissionSync, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"

const prisma = new PrismaClient()

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const user = await auth()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!hasPermissionSync(user, Permissions.ACCEPT_REQUESTS)) {
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
                accepted: action === 'accept'
            }
        })

        return new NextResponse("OK", { status: 200 })
    } catch (e) {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}