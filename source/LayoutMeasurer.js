/*
Give it children and an onLayout callback, and it will
render those outside of the view children and get the layout for the ones
that have an sceneKey property set :D
*/

import React from 'react';
import { View, Dimensions, findNodeHandle } from 'react-native';
import Promise from 'bluebird'
import invariant from 'invariant'

import defer from './defer'
import traverseScenes from './traverseScenes'

let dimensions = Dimensions.get('window');

let LayoutMeasurer = ({ children, onLayout, timesScreenWidth = 1 }) => {
  // `measures` will be filled with Promises over layouts
  let measures = {}
  // The ref of the container that contains the measured elements
  let theRealOPRef = null

  // Attach a ref to every sceneProp and save the measurePromise to measures object
  let newChildren = traverseScenes(children, ({ sceneKey }) => {
    invariant(!measures[sceneKey], `Two children with the same sceneKey '${sceneKey}'`)

    // Create defered, and save it to the measure object
    let deferred = defer()
    measures[sceneKey] = deferred.promise

    return {
      ref: ref => {
        // Ugh
        if (ref === null) {
          return
        }
        // Measure the layout, and resolve the promise belonging to it
        setTimeout(() => {
          try {
            ref.measureLayout(findNodeHandle(theRealOPRef), (left, top, width, height) => {
              deferred.resolve({ left, top, width, height })
            })
          } catch (e) {
            console.warn('Error while measuring:', e)
          }
        })
      },
    }
  })

  // Combine the promises, and call the onLayout callback with the result
  Promise.props(measures).then(layouts => {
    onLayout(layouts)
  })

  return (
    <View
      // Container ref
      ref={ref => {
        theRealOPRef = ref
      }}
      // Just fill the whole screen, outside of the screen
      style={{
        height: dimensions.height,
        width: dimensions.width * timesScreenWidth,
        position: 'absolute',
        top: 0,
        left: dimensions.width * timesScreenWidth,
      }}
      children={newChildren}
    />
  )
}

export default LayoutMeasurer
