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
npx create-react-app
```

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

Alright, let's write our `useTabState` hook. It's really simple actually!

*useTabState.ts*
```

```


