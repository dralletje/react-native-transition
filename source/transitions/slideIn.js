import { mapValues } from 'lodash'
import { Animated } from 'react-native'

import { resetStyle, parallel, SetValue } from './utils'

let zero = {
  top: 0,
  left: 0,
  height: 0,
  width: 0,
}

// Creation does not have oldLayout
let slideIn = (side) => () => {
  let animateValues =
    mapValues(zero, (value, layoutProp) => {
      return new Animated.Value(value)
    })

  let initialStyle = {
    ...resetStyle,
    ...animateValues,
  }

  let startAnimation = nextLayout => {
    return parallel(animateValues, (animatedValue, layoutProp) => {
      if (layoutProp === 'left') {
        return Animated.sequence([
          SetValue(animateValues.left, -nextLayout.width),
          Animated.spring(animateValues.left, {
            toValue: nextLayout.left,
          }),
        ])
      } else {
        return SetValue(animatedValue, nextLayout[layoutProp])
      }
    })
  }

  return {
    props: {
      style: initialStyle,
    },
    start: startAnimation,
  }
}

export default slideIn
