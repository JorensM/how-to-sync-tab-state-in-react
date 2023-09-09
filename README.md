# How to sync state across tabs in React

Sometimes you need to have state persist between tabs.

In this article I will guide you step-by-step on how to sync state across
tabs in React. First I will teach you how to *implement* such a feature, and at
the end of the post I will share with you a library that does this for you, in
case you want a ready-made solution. [Skip to library]()

This project uses TypeScript but the process is identical to JavaScript, minus the types.
Learn more about [TypeScript]()

## Table of contents

## Setup

For this project we won't be using any third-party libraries except for those
that are needed to run a React project. So let's go ahead and create a fresh
React project with [create-react-app]().

```
npx create-react-app app-name --template typescript
```

This will initialize a new React+TypeScript project with the name `app-name`. You
can change the name to whatever you like


**note:** create-react-app is not suited for production-grade projects. If you're
creating an application that will actually be used, consider [Vite]() instead

Alright, now that we have set up our project, let's get coding!

## Used technologies

To allow syncing between tabs, we will be utilizing the [BroadcastChannel API]().
This is a standard API and all major browsers have full support for it. What
`BroadcastChannel` does is allow you to send and receive data between different
browsing contexts, such as windows and tabs. 

We will be creating a custom React hook `useTabState` that will act in every way
like a regular `useState` hook, except that the state will be synced between tabs.
If you don't know what hooks are, you can read more about [React hooks]()

## The useTabState hook

Alright, let's write our `useTabState` hook. It's quite simple actually!

*useTabState.ts*
```
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
            setUpdatedState(e.data)
        })
    }, [])
    
    useEffect(() => {
        channel.postMessage(localState)
    }, [localState])

    useEffect(() => {
        if (updatedState) {
            setLocalState(updatedState!)
        }
        
    }, [updatedState])

    return [localState, setLocalState]
}
```

Okay, there's some stuff going on here, so let's break it down.

```
import { useEffect, useMemo, useState } from 'react'
```

Here we simply import all of our required functions from the `react` module. Learn
more about [importing]()

```
/* ... */
export default function useTabState<T = any>( 
    initial_value: T, 
    state_id: string 
) : 
    [
        T,
        React.Dispatch<React.SetStateAction<T>>
    ]
{
    /* ... */
}
```

This is our function declaration. We apply the `export` keyword before it so that
it can be imported and used by other files.

The `<T = any>` means that this function is generic. Learn more about [Generics]().

This part:

```
( 
    initial_value: T, 
    state_id: string 
)
```

Specified which arguments should be passed to the function. The `: string` specified
which type the specific argument should be.

```
: 
    [
        T,
        React.Dispatch<React.SetStateAction<T>>
    ]
```

This tells us the return type of the function. as  In this case it's
an array with the `T` generic and a react state dispatch action. The return type
of our function is the same as that of a regular `useState()` hook.

```
const [localState, setLocalState] = useState<T>(initial_value)
const [updatedState, setUpdatedState] = useState<T | null>(initial_value)
```

Here we are defining the state that our hook will use. I will explain the reason
why we have two states later in the article.