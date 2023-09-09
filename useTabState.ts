import { useEffect, useMemo, useState } from 'react'

export default function useTabState<T = any>( initial_value: T, state_id: string ) {
    const [localState, setLocalState] = useState<T>(initial_value)
    const [updatedState, setUpdatedState] = useState<T | null>(null)

    const channel = useMemo(() => {
        return new BroadcastChannel(state_id)
    }, [])

    useEffect(() => {
        channel.addEventListener('message', (e: MessageEvent) => {
            setUpdatedState(e.data)
        })
    }, [])
    
    useEffect(() => {
        channel.postMessage(localState)
    }, [localState])

    useEffect(() => {
        setLocalState(updatedState!)
    }, [updatedState])
}