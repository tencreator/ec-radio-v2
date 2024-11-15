export default function Filter({setFilter}: {setFilter: (filter: string) => void}) {
    return (
        <div className="">
            <label htmlFor="filter">Filter</label>
            <input type="text" className="input bg-base-300 p-2 m-4" onChange={(e) => setFilter(e.target.value)} />
        </div>
    )
}