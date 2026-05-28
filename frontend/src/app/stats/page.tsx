'use client'

import { useEffect, useState } from "react"

type Stats = {
    counts: {[key: string]: number},
    accuracy: number
}

export default function Stats() {

    const [stats, setStats] = useState<Stats | null>(null)
    const [classes, setClasses] = useState<{[key: string]: string} | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            setStats(null)
            setClasses(null)
            setError(null)
            setLoading(true)
            try {
                const [statsRes, classesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
                        method: 'GET',
                        signal: controller.signal
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
                        method: 'GET',
                        signal: controller.signal
                    })
                ])
                if (!statsRes.ok || !classesRes.ok) throw new Error('Error')
                const stats = await statsRes.json()
                const classes = await classesRes.json()
                setStats(stats)
                setClasses(classes)
            }
            catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    setError(error)
                }
            }
            finally {
                if (!controller.signal.aborted)
                    setLoading(false)
            }
        })()
        return () => controller.abort()
    }, [])

    const all = stats ? Object.values(stats.counts).reduce((all, count) => all + count) : 0

    return (
        <main className="bg-gray-800 flex-1 text-white flex flex-col items-center p-4 overflow-y-auto">
            <h2 className="font-bold text-xl p-4">Statistics</h2>
            {error && <p className="bg-red-500/20 border border-red-500 text-white rounded-md px-3 py-2 text-sm">{error.message}</p>}
            {loading && <p>Loading...</p>}
            {stats && <div className="flex gap-4 p-4">
                <p className="bg-gray-700 p-4 rounded-md flex flex-col">
                    <span className="text-sm text-gray-200">Accuracy:</span>
                    <span className={`text-xl ${stats.accuracy >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{stats.accuracy}%</span>
                </p>
                <p className="bg-gray-700 p-4 rounded-md flex flex-col">
                    <span className="text-sm text-gray-200">Total:</span>
                    <span className="text-xl">{all}</span>
                </p>
            </div>}
            <ul className="grid grid-cols-3 gap-4 auto-rows-[120px]">
                {stats && classes && Object.entries(stats.counts).map(([key, value]) => {
                    const pct = Math.round(value / (all / 100))
                    return <li key={key} className="p-4 bg-gray-600 rounded-md flex flex-col justify-between">
                            <p className="text-sm text-gray-300">{classes[key]}</p>
                            <p className="text-xl">{value}</p>
                            <p className={`${pct >= 30 ? 'text-green-400' : pct >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>{pct}%</p>
                        </li>
                    }
                )}
            </ul>       
        </main>
    )
}