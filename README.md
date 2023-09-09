# How to sync state across tabs in React

<sub>[Source code]()</sub>

Sometimes you need to have state persist between tabs.

In this article I will guide you step-by-step on how to sync state across
tabs in React. First I will teach you how to *implement* such a feature, and at
the end of the post I will share with you a library that does this for you, in
case you want a ready-made solution. [Skip to library]()

I've tried to make this article as beginner-friendly as possible, and  have 
included many links and explanations for common JS/TS/React features

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
This is a standard [Web API]() and all major browsers have full support for it. What
`BroadcastChannel` does is allow you to send and receive data between different
browsing contexts, such as windows and tabs. 

We will be creating a custom React hook `useTabState` that will act in every way
like a regular `useState` hook, except that the state will be synced between tabs.
If you don't know what hooks are, you can read more about [React hooks]()

## Creating the useTabState hook

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

Specifies which arguments should be passed to the function. The `: [type]` syntax
specifies which type the specific argument should be.

`initial_value` is the initial value of our state, and `state_id` is the unique
id of the broadcast channel.

```
: 
    [
        T,
        React.Dispatch<React.SetStateAction<T>>
    ]
```

This tells us the return type of the function. In this case it's
an array with the `T` generic and a react state dispatch action. The return type
of our function is the same as that of a regular `useState()` hook because we want
our hook to be intuitive and replicate `useState()`

```
const [localState, setLocalState] = useState<T>(initial_value)
const [updatedState, setUpdatedState] = useState<T | null>(initial_value)
```

Here we are defining the state that our hook will use. Learn more about the [useState]()
hook. I will explain the reason why we have two states later in the article.

```
const channel = useMemo(() => {
    return new BroadcastChannel(state_id)
}, [])
```

Here we've defined a variable `channel` which will be the instance of our
`BroadcastChannel` object. [useMemo]() is simply a function that prevents
the `channel` variable from being re-initialized on each render. Here we pass
an empty array to the `useMemo`, meaning that the `channel` variable will only
be assigned once, during initial mount.

```
useEffect(() => {
    channel.addEventListener('message', (e: MessageEvent) => {
        setUpdatedState(e.data)
    })
}, [])
```

[useEffect]() is a common react hook that allows you to run a [callback]() each
time a state value changes. If you pass an empty array as the second argument, like
we have done here, then the callback will be run once, upon mount(or twice if you're
using [strict mode](https://react.dev/reference/react/StrictMode).

So upon mount, we will run `channel.addEventListener...`, which adds an [event listener]()
to our broadcast channel. Each time a message is broadcast to the channel(for 
example from another tab), this event listener gets called, and it in turn calls
`setUpdatedState()`, passing the received data and updating our local state.

```
useEffect(() => {
    channel.postMessage(localState)
}, [localState])
```

Here we have another `useEffect` hook. This time we have passed a dependency - 
`localState`, which means that each time `localState`'s value changes, the function
in the `useEffect()` gets called. The function is `channel.postMessage()`, which
broadcasts a message to other instances of `BroadcastChannel`(that reside in 
other tabs). So when we broadcast a message from one tab's `channel`, the other
tabs' `channel`s receive this message and update the local state of the other tabs

So at this point you might be wondering, why do we have 2 different states, 
`localState` and `updatedState`? Imagine if we only had one state - `localState`.
We would have to add a `BroadcastChannel` event listener that would update `localState`,
and we would also have a `useEffect()` hook that would listen for `localState` changes
in order to broadcast the local state to other channels. The code would look something
like this: 

```
useEffect(() => {
    channel.addEventListener('message', (e: MessageEvent) => {
        setLocalState(e.data)
    })
}, [])

useEffect(() => {
    channel.postMessage(localState)
}, [localState])
```

What would happen is that we would get an infinite loop because when `localState`
would change, a message would be broadcast. The receiving tab's event listener would
set its `localState`, triggering the `useEffect()`, which would again broadcast
the message, and so on.

So the solution is to use what I call a 'proxy state'. In this case our proxy state is
the `updatedState` state. When a message is received, we first update the state in this
`updatedState`, and only after that we update the `localState` with the `updatedState`'s
new value.

```
useEffect(() => {
    if (updatedState) {
        setLocalState(updatedState)
    }        
}, [updatedState])
```

Finally we return the `localState` and `setLocalState`

```
return [localState, setLocalState]
```

## Using our newly created hook

Alright, we have created our `useTabState` hook, now let's see it in action.

Here is some basic code that you can put in your `App.tsx` to test the hook:

*App.tsx*:
```
import useTabState from './useTabState';

function App() {

  const [ count, setCount ] = useTabState<number>(0, 'count')

  return (
    <div>
      <button
        onClick={() => setCount(count + 1)}
      >
        { count }
      </button>
    </div>
  );
}

export default App;
```

Now run your app with `npm start` and open it in several tabs, then try clicking
the button. The counter should increase and sync the value with other tabs!

Yay! We did it!

## The library

There are some issues with our implementation though. For example, when we open
a new tab, the state will initially show 0 until we click the button. Additionally,
if we click the button in a newly opened tab, the state will reset! There is some
other stuff as well - for example what if we want to have a single 'central' tab
from which the state gets updated. I won't be covering these issues in this article,
but I can share with you a library that I've written - [react-tab-state]. This library
solves the aforementioned issues and provides a simple and easy to use hook that
can be used exactly the same way as a regular `useState()` hook. If you don't care
about the specifics, you can install this package into your project and get going.
If you're interested in seeing how it works, feel free the check out 
[react-tab-state's source code]().

## Conclusion

In this article we learned how to make a basic implementation of a hook that
syncs state across tabs. I hope you learned something new from it and I wish you
luck in your projects! If you have any questions or comments, feel free to leave
them here or on the [repo]()

<sub>Article originally published on [dev.to]()</sub>