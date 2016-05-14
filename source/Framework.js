/*
It's called `Framework` because I couldn't find a better name for
a composition of 'frames' in my screen... :/

All it does is make it easier for me to flip the SIDE_BY_SIDE switch,
that will, if true, put the layoutmeasurer visible in the screen :)
*/

const SIDE_BY_SIDE = false

import React from 'react'
import { View, Dimensions } from 'react-native'

import LayoutMeasurer from './LayoutMeasurer'

let Framework = ({
  onLayout, children,
  childrenToBeRemoved, newChildren = children,
}) => {
  if (!SIDE_BY_SIDE) {
    return (
      <View style={{ flex: 1 }}>
        {/* Start measuring the end result */}
        <LayoutMeasurer
          onLayout={onLayout}
          children={children}
        />
        {/* Render the new scene */}
        { newChildren }
        { childrenToBeRemoved }
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Start measuring the end result */}
      <LayoutMeasurer
        onLayout={onLayout}
        children={children}
        timesScreenWidth={0.5}
      />
      {/* Render the new scene */}
      <View
        style={{
          flex: 1,
          width: Dimensions.get('window').width / 2,
          borderRightWidth: 1,
          borderRightColor: 'black',
          overflow: 'hidden',
        }}
      >
        { newChildren }
        { childrenToBeRemoved }
      </View>
    </View>
  )
}

export default Framework
