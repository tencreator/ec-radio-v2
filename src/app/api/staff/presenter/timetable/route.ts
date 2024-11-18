import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { Permissions, hasPermissionSync } from "@/utils/permissions";
import { getFormattedDate, getFormattedTime } from "@/utils/functions";
import { PrismaClient } from "@prisma/client";
import Discord from "@/utils/apis/discord";
import Caching from "@/utils/cache";

const prisma = new PrismaClient()
const discord = new Discord(process.env.DISCORD_BOT_TOKEN as string)
const cache = new Caching()

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.providerId) return new NextResponse("Unauthorized", { status: 401 })
        if (!hasPermissionSync(session, Permissions.SELF_CONNECTION)) return new NextResponse("Forbidden", { status: 403 })

        const date = await getFormattedDate(req.nextUrl.searchParams.get('date') as string)
        if (!date) return new NextResponse("Invalid date", { status: 400 })
        
        if (cache.has(`timetable-${date}`)) {
            return new NextResponse(cache.get(`timetable-${date}`), { headers: { "content-type": "application/json" } })
        }

        const timetable = await prisma.timetable.findMany({
            where: {
                date: date,
            },
        })

        const timetableWithUsers = await Promise.all(timetable.map(async (booking) => {
            const user = await discord.getUserData(booking.userid)

            if (user) {
                return {
                    id: booking.id,
                    date: booking.date,
                    time: booking.time,
                    user: {
                        id: booking.userid,
                        name: user.displayName,
                        avatar: user.avatar,
                    },
                }
            } else {
                return {
                    id: booking.id,
                    date: booking.date,
                    time: booking.time,
                    user: {
                        id: booking.userid,
                        name: "Unknown",
                        avatar: "",
                    },
                }
            }
        }))

        cache.set(`timetable-${date}`, JSON.stringify({bookings: timetableWithUsers}), 60)

        return new NextResponse(JSON.stringify({bookings: timetableWithUsers}), { headers: { "content-type": "application/json" } })
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

        const time = await getFormattedTime(`${req.nextUrl.searchParams.get('time') as string}`)
        console.log(time)
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

        cache.delete(`timetable-${date}`)

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

        await prisma.timetable.deleteMany({
            where: {
                date: date,
                time: time,
                userid: session.user.providerId,
            },
        })

        cache.delete(`timetable-${date}`)

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