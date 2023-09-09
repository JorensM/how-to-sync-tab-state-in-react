# How to sync state across tabs in React

Sometimes you need to have state persist between tabs.

In this article I will guide you step-by-step on how to sync state across
tabs in React. First I will teach you how to *implement* such a feature, and at
the end of the post I will share with you a library that does this for you, in
case you want a ready-made solution. [Skip to library]()

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
