import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { Permissions, hasPermissionSync } from "@/utils/permissions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.providerId) return new NextResponse("Unauthorized", { status: 401 })
        if (!hasPermissionSync(session, Permissions.SELF_CONNECTION)) return new NextResponse("Forbidden", { status: 403 })

        const date = await getFormattedDate(req.nextUrl.searchParams.get('date') as string)
        if (!date) return new NextResponse("Invalid date", { status: 400 })

        const timetable = await prisma.timetable.findMany({
            where: {
                date: date,
            },
        })

        return new NextResponse(JSON.stringify({bookings: timetable}), { headers: { "content-type": "application/json" } })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.providerId) return new NextResponse("Unauthorized", { status: 401 })
        if (!hasPermissionSync(session, Permissions.SELF_CONNECTION)) return new NextResponse("Forbidden", { status: 403 })

        const date = await getFormattedDate(req.nextUrl.searchParams.get('date') as string)
        if (!date) return new NextResponse("Invalid date", { status: 400 })

        const time = await getFormattedTime(req.nextUrl.searchParams.get('time') as string)
        if (!time) return new NextResponse("Invalid time", { status: 400 })

        const booking = await prisma.timetable.create({
            data: {
                date: date,
                time: time,
                userid: session.user.providerId,
            },
        })

        await prisma.timetablelogs.create({
            data: {
                date: date,
                time: time,
                userid: session.user.providerId,
                action: "create",
            },
        })

        return new NextResponse(JSON.stringify({booking: booking}), { headers: { "content-type": "application/json" } })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.providerId) return new NextResponse("Unauthorized", { status: 401 })
        if (!hasPermissionSync(session, Permissions.SELF_CONNECTION)) return new NextResponse("Forbidden", { status: 403 })

        const date = await getFormattedDate(req.nextUrl.searchParams.get('date') as string)
        if (!date) return new NextResponse("Invalid date", { status: 400 })

        const time = await getFormattedTime(req.nextUrl.searchParams.get('time') as string)
        if (!time) return new NextResponse("Invalid time", { status: 400 })

        const booking = await prisma.timetable.findFirst({
            where: {
                date: date,
                time: time,
                userid: session.user.providerId,
            },
        })

        if (!booking) return new NextResponse("Booking not found", { status: 404 })

        await prisma.timetable.delete({
            where: {
                id: booking.id,
            },
        })

        await prisma.timetablelogs.create({
            data: {
                date: date,
                time: time,
                userid: session.user.providerId,
                action: "delete",
            },
        })

        return new NextResponse("Success", { status: 200 })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

async function getFormattedDate(date: string): Promise<string | false> {
    if (!date) return false
    
    try {
        const dateObj = new Date(date)
        if (dateObj.toString() == "Invalid Date") return false
        const formattedDate = dateObj.toISOString().split("T")[0]
        return formattedDate
    } catch {
        return false
    }
}

async function getFormattedTime(time: string): Promise<string | false> {
    if (!time) return false

    try {
        const timeObj = new Date(time)
        if (timeObj.toString() == "Invalid Date") return false
        const formattedTime = timeObj.toISOString().split("T")[1].split(".")[0]
        return formattedTime
    } catch {
        return false
    }
}