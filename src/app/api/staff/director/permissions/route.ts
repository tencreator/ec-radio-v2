import { PrismaClient } from "@prisma/client"
import Caching from "@/utils/cache"
import { hasPermission, Permissions } from "@/utils/permissions";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import Discord from "@/utils/apis/discord";
import { LogChannels } from "@/utils/apis/db";
import { title } from "process";

const prisma = new PrismaClient()
const cache = new Caching()
const discord = new Discord(process.env.DISCORD_BOT_TOKEN as string)

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.providerId) return new NextResponse("Unauthorized", { status: 401 })
        if (!await hasPermission(session.user.providerId, Permissions.VIEW_PERMISSIONS)) return new NextResponse("Unauthorized", { status: 401 })
    
        const id = req.nextUrl.searchParams.get("id")

        if (id) {
            if (cache.has(`perms-${id}`)) {
                return new NextResponse(cache.get(`perms-${id}`), { status: 200 })
            }

            const dbRes = await prisma.permissions.findUnique({where: {id: Number(id)}})
            if (!dbRes) return new NextResponse("Not Found", { status: 404 })

            const roleData = await discord.getRoleData(dbRes.roleid)
            const perms = {
                id: dbRes.id,
                roleid: dbRes.roleid,
                roleName: roleData.name,
                permissions: dbRes.permissions
            }

            return new NextResponse(JSON.stringify(perms), { status: 200 })
        }

        if (cache.has("perms")) {
            return new NextResponse(cache.get("perms"), { status: 200 })
        }
    
        const dbRes = await prisma.permissions.findMany({})
        const perms = await Promise.all(dbRes.map(async perm => {
            const roleData = await discord.getRoleData(perm.roleid)
    
            return {
                id: perm.id,
                roleid: perm.roleid,
                roleName: roleData.name
            }
        }))
    
        cache.set("perms", JSON.stringify(perms), 300)
    
        return new NextResponse(JSON.stringify(perms), { status: 200 })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.providerId) return new NextResponse("Unauthorized", { status: 401 })
        if (!await hasPermission(session.user.providerId, Permissions.DELETE_PERMISSIONS)) return new NextResponse("Unauthorized", { status: 401 })
    
        const body = await req.json()
        const { id } = body
        await prisma.permissions.delete({where: {id}})

        await discord.sendLog(LogChannels.PERMISSIONS_CHANGED, {
            author: {
                name: session.user.displayName,
                icon_url: session.user.image
            },
            description: `Deleted permission with ID ${id}`,
            title: "Permission Deleted",
            fields: [{
                name: "Role ID",
                value: id
            }, {
                name: "Role",
                value: `<@&${id}>`
            }, {
                name: "Action",
                value: "Deleted"
            }]
        })
    
        cache.delete("perms")
        cache.delete(`perms-${id}`)
    
        return new NextResponse("Deleted", { status: 200 })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.providerId) return new NextResponse("Unauthorized", { status: 401 })
        if (!await hasPermission(session.user.providerId, Permissions.CREATE_PERMISSIONS)) return new NextResponse("Unauthorized", { status: 401 })
    
        const body = await req.json()
        const { roleid } = body
    
        const dbCheck = await prisma.permissions.findFirst({where: {roleid}})
        if (dbCheck) return new NextResponse("Role already has a permission", { status: 400 })
    
        const { permissions } = body
        await prisma.permissions.create({data: {roleid, permissions}})

        await discord.sendLog(LogChannels.PERMISSIONS_CHANGED, {
            author: {
                name: session.user.displayName,
                icon_url: session.user.image
            },
            title: "Permission Created",
            description: `Created permission for role <@&${roleid}>`,
            fields: [{
                name: "Role ID",
                value: roleid
            }, {
                name: "Role",
                value: `<@&${roleid}>`
            }, {
                name: "Action",
                value: "Created"
            }]
        })
    
        cache.delete("perms")
    
        return new NextResponse("Created", { status: 200 })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()
        if (!session || !session.user || !session.user.providerId) return new NextResponse("Unauthorized", { status: 401 })
        if (!await hasPermission(session.user.providerId, Permissions.EDIT_PERMISSIONS)) return new NextResponse("Unauthorized", { status: 401 })
    
        const body = await req.json()
        const { id, roleid, permissions } = body
        await prisma.permissions.update({where: {id}, data: {roleid, permissions}})
    
        await discord.sendLog(LogChannels.PERMISSIONS_CHANGED, {
            author: {
                name: session.user.displayName,
                icon_url: session.user.image
            },
            title: "Permission Updated",
            description: `Updated permission for role <@&${roleid}>`,
            fields: [{
                name: "Role ID",
                value: roleid
            }, {
                name: "Role",
                value: `<@&${roleid}>`
            }, {
                name: "Action",
                value: "Updated"
            }]
        })

        cache.delete("perms")
        cache.delete(`perms-${id}`)
    
        return new NextResponse("Updated", { status: 200 })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}