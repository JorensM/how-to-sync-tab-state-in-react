import { useEffect, useMemo, useState } from 'react'

export default function useTabState<T = any>( 
    initial_value: T, 
    state_id: string 
) : 
    [
        T,
        React.Dispatch<React.SetStateAction<T>>
    ]
{
    const [localState, setLocalState] = useState<T>(initial_value)
    const [updatedState, setUpdatedState] = useState<T | null>(initial_value)

    const channel = useMemo(() => {
        return new BroadcastChannel(state_id)
    }, [])

    useEffect(() => {
        channel.addEventListener('message', (e: MessageEvent) => {
            //console.log('msg received')
            setUpdatedState(e.data)
            //setLocalState(e.data)
        })
    }, [])
    
    useEffect(() => {
        console.log('local state changed\n')
        channel.postMessage(localState)
    }, [localState])

    useEffect(() => {
        if (updatedState) {
            setLocalState(updatedState)
        }
        
    }, [updatedState])

    return [localState, setLocalState]
}