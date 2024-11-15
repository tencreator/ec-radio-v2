class Caching {
    private cache: Map<string, any> = new Map()

    public get(key: string): any {
        return this.cache.get(key)
    }

    public set(key: string, value: any, timeout: number): void {
        this.cache.set(key, value)

        setTimeout(() => {
            this.cache.delete(key)
        }, timeout * 1000)
    }

    public has(key: string): boolean {
        return this.cache.has(key)
    }
}

export default Caching
export { Caching }