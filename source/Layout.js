import React from 'react';
import { View , Dimensions, findNodeHandle } from 'react-native';
import { mapValues } from 'lodash';

import defer from './defer'

let dimensions = Dimensions.get('window');

import Promise from 'bluebird'
import invariant from 'invariant'

import traverseScenes from './traverseScenes'

let LayoutMeasurer = ({ children, onLayout, timesScreenWidth = 1 }) => {
  let measures = {}
  let theRealOPRef = null

  // Attach a ref to every sceneProp and save the measurePromise to measures object
  let newChildren = traverseScenes(children, ({ sceneKey }) => {
    let deferred = defer()
    invariant(!measures[sceneKey], `Two children with sceneKey '${sceneKey}'`)
    measures[sceneKey] = deferred.promise

    return {
      sceneRef: ref => {
        if (ref === null) {
          return
        }
        setTimeout(() => {
          try {
            ref.measureLayout(findNodeHandle(theRealOPRef), (left, top, width, height) => {
              deferred.resolve({ left, top, width, height })
            })
          } catch (e) {
            console.log('Error while measuring:', e)
          }
        })
      },
    }
  })

  // Combine them and call callback when ready
  Promise.props(measures).then(layouts => {
    onLayout(layouts)
  })

  return (
    <View
      ref={ref => {
        theRealOPRef = ref
      }}
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
