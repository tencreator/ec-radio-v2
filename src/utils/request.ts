import "server-only"
import { headers, cookies } from "next/headers"

async function makeRequest(uri: string, options: RequestInit) {
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    return fetch(url + uri, {
        headers: {
            'Cookie': (await cookies()).toString()
        },
        ...options
    })
}

export { makeRequest }