export default async function sanitize(value: string, bypassScripting: boolean) {
    if(!bypassScripting || typeof bypassScripting == 'undefined') {
        if(value.toLowerCase().includes('</')) {
            value = value.replaceAll('<', 'NULLED:lessThan').replaceAll('>', 'NULLED:greaterThan')
        }
    }

    value = value.replaceAll('"', '\'').replaceAll('`', '\`').replaceAll("'", "\'")
    return value
}
