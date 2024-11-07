"use server"

import chalk from 'chalk'

class log extends Error {
    private module: string
    private readonly template: string = [
        chalk.gray('['),
        '{{DATE}}',
        chalk.grey('] '),
        chalk.gray('['),
        chalk.magenta('{{MODULE}}'),
        chalk.grey('] '),
        chalk.gray('['),
        '{{KIND}}',
        chalk.grey(']: '),
        '{{MESSAGE}}'
    ].join('')

    constructor(module: string) {
        super()
        this.module = module
    }

    public async writeLog(rawMsg: string, kind: string, debug?: boolean) {
        const date = new Date().toISOString().replace('T', ':').split('.')[0]

        const msg = this.template
            .replace('{{DATE}}', date)
            .replace('{{MODULE}}', this.module)
            .replace('{{KIND}}', kind)
            .replace('{{MESSAGE}}', rawMsg)

        if (kind == chalk.blue('DEBUG') && !debug) return
        else return console.log(msg)
    }

    public async info(msg: string | string[]) {
        if (Array.isArray(msg)) {
            for (const m of msg) {
                this.writeLog(m, chalk.blue('INFO'))
            }
        } else this.writeLog(msg, chalk.blue('INFO'))
    }

    public async warn(msg: string | string[]) {
        if (Array.isArray(msg)) {
            for (const m of msg) {
                this.writeLog(m, chalk.yellow('WARN'))
            }
        } else this.writeLog(msg, chalk.yellow('WARN'))
    }

    public async error(msg: string | string[]) {
        if (Array.isArray(msg)) {
            for (const m of msg) {
                this.writeLog(m, chalk.red('ERROR'))
            }
        } else this.writeLog(msg, chalk.red('ERROR'))
    }

    public async debug(msg: string | string[], debug?: boolean) {
        if (Array.isArray(msg)) {
            for (const m of msg) {
                this.writeLog(m, chalk.blue('DEBUG'), debug)
            }
        } else this.writeLog(msg, chalk.blue('DEBUG'), debug)
    }

    public async fatal(msg: string | string[]) {
        if (Array.isArray(msg)) {
            for (const m of msg) {
                this.writeLog(m, chalk.red('FATAL'))
            }
        } else this.writeLog(msg, chalk.red('FATAL'))
    }
}

export default log
export { log }