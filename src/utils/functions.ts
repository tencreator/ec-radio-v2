async function sanitize(value: string, bypassScripting: boolean) {
    if(!bypassScripting || typeof bypassScripting == 'undefined') {
        if(value.toLowerCase().includes('</')) {
            value = value.replaceAll('<', 'NULLED:lessThan').replaceAll('>', 'NULLED:greaterThan')
        }
    }

    value = value.replaceAll('"', '\'').replaceAll('`', '\`').replaceAll("'", "\'")
    return value
}

async function getFormattedDate(date: string): Promise<string | false> {
    if (!date) return false
    
    try {
        const dateObj = new Date(date)
        if (dateObj.toString() == "Invalid Date") return false
        const formattedDate = dateObj.toISOString().split("T")[0]
        return formattedDate
    } catch (e) {
        console.log(e)
        return false
    }
}

async function getFormattedTime(time: string): Promise<string | false> {
    if (!time) return false

    try {
        const timeObj = new Date()
        timeObj.setHours(parseInt(time))
        timeObj.setMinutes(0)
        timeObj.setSeconds(0)
        timeObj.setMilliseconds(0)
        const formattedTime = timeObj.toISOString().split("T")[1].split(".")[0]
        return formattedTime
    } catch (e) {
        console.log(e)
        return false
    }
}

export { sanitize, getFormattedDate, getFormattedTime }