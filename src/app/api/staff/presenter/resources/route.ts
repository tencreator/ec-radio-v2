import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/utils/auth"
import { Permissions, hasPermission } from "@/utils/permissions"
import { PrismaClient } from "@prisma/client"
import Caching from "@/utils/cache"

const prisma = new PrismaClient()
const cache = new Caching()

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!await hasPermission(session.user.providerId, Permissions.VIEW_RESOURCES)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const id = req.nextUrl.searchParams.get("id")

        if (!id) {
            if (cache.has("resources")) {
                return new NextResponse(cache.get("resources"), {
                    headers: {
                        "content-type": "application/json",
                    },
                })
            }
    
            const dbRes = await prisma.resources.findMany({})
            const resources = dbRes.map((resource) => {
                return {
                    id: resource.id,
                    name: resource.name,
                    tags: resource.tags.split(','),
                    url: resource.url,
                }
            })
    
            cache.set("resources", JSON.stringify(resources), 300)
    
            return new NextResponse(JSON.stringify(resources), {
                headers: {
                    "content-type": "application/json",
                },
            })
        }

        if (isNaN(parseInt(id))) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        if (cache.has(`resources-${id}`)) {
            return new NextResponse(cache.get(`resources-${id}`), {
                headers: {
                    "content-type": "application/json",
                },
            })
        }

        const dbRes = await prisma.resources.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!dbRes) {
            return new NextResponse("Not Found", { status: 404 })
        }

        return new NextResponse(JSON.stringify(dbRes), {
            headers: {
                "content-type": "application/json",
            }
        })
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

        if (!await hasPermission(session.user.providerId, Permissions.MANAGE_RESOURCES)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await req.json()
        const { name, url, tags } = body

        if (!name || !url || !tags) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        await prisma.resources.create({
            data: {
                name,
                url,
                tags,
            }
        })

        cache.delete("resources")

        return new NextResponse("Created", { status: 201 })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!await hasPermission(session.user.providerId, Permissions.MANAGE_RESOURCES)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await req.json()
        const { id } = body

        if (isNaN(parseInt(id))) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        await prisma.resources.delete({
            where: {
                id: parseInt(id)
            }
        })

        cache.delete("resources")

        return new NextResponse("Deleted", { status: 200 })
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth()

        if (!session || !session.user || !session.user.providerId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!await hasPermission(session.user.providerId, Permissions.MANAGE_RESOURCES)) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await req.json()
        const { id, name, url, tags } = {
            id: body.id,
            name: body.name,
            url: body.url,
            tags: body.tags.join(','),
        }

        if (isNaN(parseInt(id)) || !name || !url || !tags) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        await prisma.resources.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name,
                url,
                tags
            }
        })

        cache.delete("resources")

        return new NextResponse("Updated", { status: 200 })
    } catch (e: any) {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}