export default function Filter({setFilter}: {setFilter: (filter: string) => void}) {
    return (
        <div>
            <input type="text" onChange={(e) => setFilter(e.target.value)} />
        </div>
    )
}