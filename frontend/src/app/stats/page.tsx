'use client'

import { useEffect, useState } from "react"

type Data = {
    counts: {[key: string]: number},
    accuracy: number
}

export default function Stats() {

    const [data, setData] = useState<Data | null>(null)
    const [classes, setClasses] = useState<{[key: string]: string} | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        (async () => {
            setData(null)
            setError(null)
            try {
                let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
                    method: 'GET'
                })
                if (!response.ok) throw new Error('Error')
                let data = await response.json()
                setData(data)
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
                    method: 'GET'
                })
                if (!response.ok) throw new Error('Error')
                data = await response.json()
                setClasses(data)
            }
            catch (error) {
                if (error instanceof Error) {
                    setError(error)
                }
            }
        })()
    }, [])

    const all = data ? Object.values(data.counts).reduce((all, count) => all + count) : 0

    return (
        <main className="bg-gray-800 flex-1 text-white flex flex-col items-center p-4 overflow-y-auto">
            {error && <p className="bg-red-500/20 border border-red-500 text-white rounded-md px-3 py-2 text-sm">{error.message}</p>}
            <h2 className="font-bold text-xl p-4">Статистика</h2>
            {data && <div className="flex gap-4 p-4">
                <p className="bg-gray-700 p-4 rounded-md flex flex-col">
                    <span className="text-sm text-gray-200">Точность:</span>
                    <span className={`text-xl ${data.accuracy >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{data.accuracy}%</span>
                </p>
                <p className="bg-gray-700 p-4 rounded-md flex flex-col">
                    <span className="text-sm text-gray-200">Всего:</span>
                    <span className="text-xl">{all}</span>
                </p>
            </div>}
            <ul className="grid grid-cols-3 gap-4 auto-rows-[120px]">
                {data && classes && Object.entries(data.counts).map(([key, value]) => {
                    const pct = Math.round(value / (all / 100))
                    return <li key={key} className="p-4 bg-gray-600 rounded-md flex flex-col justify-between">
                            <p className="text-sm text-gray-400">{classes[key]}</p>
                            <p className="text-xl">{value}</p>
                            <p className={`${pct >= 30 ? 'text-green-400' : pct >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>{pct}%</p>
                        </li>
                    }
                )}
            </ul>       
        </main>
    )
}