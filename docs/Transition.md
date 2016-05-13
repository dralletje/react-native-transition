# Transition

Where this library provides the framework and tools needed, it won't apply animations by itself, you need to explicitly define which transition animations to use where.
I have some transitions for you build-in, but beware: **It will not fit all your needs** or even come close trying to.

That is why I made this guide, so you can go ahead and program your own transitions.

### Types

- **Enter**, Transition for when a element is newly added to the scene. Doesn't get the `oldLayout` passed in to the function (because there was no)
- **Change**, Transition when a element is present in the old and new scene, and should go from the old to the new position, some way. _The most interesting type, if you ask me._
- **Leave**, Transition a element out of the scene. Doesn't get a `newLayout`, because, again, there **is no** new layout to transition to. Still possible to use the `oldLayout`

### Definition

The transition is a function that will be called when preparing to animate to the new scene.

##### Arguments passed in
At this time, the new layout is not yet available, but the new props are. So this, plus some other stuff is passed in, making the total amount of argument to four:

- The current layout (top, left, width, height)
  **(null when _enter_ transition)**
- Dimensions of the phone screen (width, height)
- The props the element received before the transition away.
  **(null when _enter_ transition)**
- The props the element will have after the transition **(null when _leave_ transition)**

##### Adding options to Transition
You can ofcourse make a function that returns transition functions, for example, to pass in some options, before passing it to the framework

```javascript
let transitionWithDuration = (duration, easing = Easing.EaseInOut) => (oldLayout, dimensions, oldProps, newProps) => {
  // Your function
}
```

##### Return value
When called, the transition function should return an object with two keys:

- **props**, the initial props to shallowly merge with the other props on the View (it won't merge style or support refs)
- **start(newLayout)**, function to run when animation is about to start. It will get passed in the new layout for the element (top, left, width, height) and is expected to _return the animations_

##### Return animation?!
Indeed, _return_ the animations. In React Native, with Animated, you are actually creating animations objects first, running them in a extra step.
```javascript
Animated.spring(...).start() // Notice the .start()!!!
```
As a transition, you have to return the actual animations, instead of starting them yourself.
```javascript
return Animated.spring(...) // No .start()!!!!
```
I have no idea how this is useful yet, but I have the feeling it will help when we need async animations, or for performance. I have no idea what I'm saying.


### Utils

To be more effective, I use two utils very much myself:
- The `SetValue` animation
- The `Animated.parallel()` function to bundle animations

##### SetValue
`SetValue` is a little util function I wrote to have some animations be, not actual animations, but just the setting of a value directly, I could have used a animation with duration 0 or 1, but I found this more solid/fancy. Still your `transition.start` can return this, and it will work just like an 'normal' animation

```javascript
export let SetValue = (animatedValue, value) => {
  return {
    start: (cb) => {
      animatedValue.setValue(value)
      cb({ finished: true })
    },
    stop: () => {},
  }
}
```

usage
```javascript
return Animated.parallel([
  SetValue(animatedValue1, 100),
  SetValue(animatedValue2, 190),
])
```

##### Animated.parallel

`Animated.parallel()` is a function in the standard `Animated` lib, that will do nothing more than wrapping a passed in **array** of animations into one animation, that will run all the bundles animations in, you would have guessed, parallel.
