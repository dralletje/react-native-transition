/*
1. Current scene is rendered on the visible screen.
2. New scene is requested.
3. Render *new scene outside of the visible screen, and keep the
   old scene on the visible screen.
4. Move new scene (with modifications) on visible screen.
   The modifications should make it look exactly like the old screen.
   Move old screen outside of the visible screen.
5. Start animation
6. New screen should, at the end of the animation, look exactly like... the new screen 😁
...Start again from step one, with the new scene being the next current scene
*/

import React from 'react'
import { Animated, View, Text, Image } from 'react-native'
import Promise from 'bluebird'
import invariant from 'invariant'
import { difference } from 'lodash'

import scenePropTypes from './scenePropTypes'
import defer from './defer'
import Framework from './Framework'
import traverseScenes from './traverseScenes'
import runTransition from './runTransition'

let AnimatedComponents = new Map([
  [View, Animated.View],
  [Image, Animated.Image],
  [Text, Animated.Text],
])

let getAnimatedComponent = prevComponent => {
  let Component =
    AnimatedComponents.has(prevComponent)
    ? AnimatedComponents.get(prevComponent)
    : Animated.createAnimatedComponent(prevComponent)

  AnimatedComponents.set(prevComponent, Component)
  return Component
}

let Scene = ({ children, animatable, transitionConfig }) => {
  // Get layout and props from previous measure
  let old = animatable.get()

  // If there is no old layout (first render inside SceneContainer)
  // render it without modifications, and measure it
  if (!old.layouts) {
    // Save props for possible deletion in next scene
    let propsCollection = {}
    let newChildren = traverseScenes(children, ({ sceneKey, ...props }, prevComponent) => {
      let Component = getAnimatedComponent(prevComponent)

      invariant(!propsCollection[sceneKey], `Two children with sceneKey '${sceneKey}'`)
      propsCollection[sceneKey] = { Component: prevComponent, props }
      return {
        ...props,
        Component,
      } // Do iterate it's children as well
    })

    // Render and measure
    return (
      <Framework
        onLayout={realLayouts => {
          animatable.update(realLayouts, propsCollection)
        }}
        children={children}
        newChildren={newChildren}
      />
    )
  }

  // Collections of all references in this render, and
  // the props of all sceneKey-children it will render
  let refs = {}
  let propsCollection = {}

  // Traverse all the sceneKey-children
  let newChildren = traverseScenes(children, ({ sceneKey, ...nextProps }, prevComponent) => {
    invariant(!refs[sceneKey], `Two children with sceneKey '${sceneKey}'`)
    invariant(!old.props || !old.props[sceneKey] || old.props[sceneKey].Component === prevComponent, `Component type changed for sceneKey '${sceneKey}'`)

    // Save the promise that will yield the reference and save the props
    let deferred = defer()
    refs[sceneKey] = deferred.promise
    propsCollection[sceneKey] = {
      props: nextProps,
      Component: prevComponent,
    }

    // Figure out the Animated-version of the component (Custom @TODO ???)
    let Component = getAnimatedComponent(prevComponent)

    // When no old layout exists, it means the child is new
    let transitionType = !old.layouts[sceneKey] ? 'ENTER' : 'CHANGE'

    // Get the props and the handler to start the animation
    let { props, startAnimation } = runTransition(transitionConfig[sceneKey], transitionType, {
      nextProps,
      layout: old.layouts && old.layouts[sceneKey],
      prevProps: old.props && old.props[sceneKey] && old.props[sceneKey].props,
    })

    // Return the new props (only ref) and Component Type
    return {
      ...props,
      Component,
      ref: ref => {
        ref && deferred.resolve({ ref, startAnimation })
      },
    }
  })

  // Figure out which sceneKey-children are no longer preset (so need a LEAVE transition)
  let removedKeys = difference(Object.keys(old.layouts), Object.keys(refs))
  let childrenThatWillBeRemovedInNextIteration = removedKeys
  // Filter out keys that do not have a leave transition,
  // we can just directly remove them
  .filter(sceneKey => {
    let transition = transitionConfig[sceneKey]
    return transition && typeof transition.leave === 'function'
  })
  // Create new elements out of them, to revive them on the scene
  .map(sceneKey => {
    let deferred = defer()
    refs[sceneKey] = deferred.promise

    let Component = old.props[sceneKey] === Text ? Animated.Text : Animated.View

    // Figure out the start props and animation handle
    let { props, startAnimation } = runTransition(transitionConfig[sceneKey], 'LEAVE', {
      layout: old.layouts[sceneKey],
      prevProps: old.props[sceneKey].props,
    })

    return (
      <Component
        // Props contains the prevProps and transition props merged
        // (And styles merged as well!)
        {...props}
        key={sceneKey}
        ref={ref => {
          ref && deferred.resolve({ ref, startAnimation })
        }}
      />
    )
  })

  // Function to run when we got all the next layouts
  let runAllAnimations = (nextLayouts) => {
    // Store the layouts and props, because we'll need them on next scene change
    animatable.update(nextLayouts, propsCollection)

    // Wait for all the refs to resolve
    Promise.props(refs).then(realRefs => {
      // Map every element to a set of animations to do on that element
      let animations = Object.keys(realRefs).map(key => {
        return realRefs[key].startAnimation(nextLayouts[key]) || null
      })
      // Filter out the ones that do not participate
      .filter(Boolean)

      // Run them all :D
      Animated.parallel(animations).start()
    })
  }

  return (
    <Framework
      onLayout={runAllAnimations}
      children={children}
      newChildren={newChildren}
      childrenToBeRemoved={childrenThatWillBeRemovedInNextIteration}
    />
  )
}

Scene.PropTypes = scenePropTypes

export default Scene
