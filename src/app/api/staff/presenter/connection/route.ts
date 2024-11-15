import { NextRequest, NextResponse } from "next/server";
import { Azuracast } from "@/utils/apis/azuracast";
import { auth } from "@/utils/auth";
import { Permissions, hasPermissionSync } from "@/utils/permissions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        if (!hasPermissionSync(session, Permissions.SELF_CONNECTION)) {
            return new NextResponse("Forbidden", {status: 403})
        }

        const hasAccount = await Azuracast.hasDjAccount(session.user.providerId as string)
        if (!hasAccount) return new NextResponse("Not Found", {status: 404})

        const account = await prisma.djaccounts.findFirst({
            where: {
                discordid: session.user.providerId as string
            }
        })
        if (!account) return new NextResponse("Not Found", {status: 404})

        return new NextResponse(JSON.stringify(account), {status: 200})
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

        if (!hasPermissionSync(session, Permissions.SELF_CONNECTION)) {
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

        return new NextResponse(JSON.stringify(res2), {status: 200})
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

        if (!hasPermissionSync(session, Permissions.SELF_CONNECTION)) {
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

        return new NextResponse("OK", {status: 200})
    } catch (e) {
        return new NextResponse("Internal Server Error", {status: 500})
    }
}