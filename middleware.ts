export { auth as middleware } from "@/utils/auth"

export const config = {
    unstable_allowDynamic: [
        'src/utils/log.ts'
    ]
}