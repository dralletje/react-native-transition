import { mapValues } from 'lodash'
import { Animated } from 'react-native'

import { resetStyle } from './utils'

let slideOut = (side) => ({ top, left, width, height }, dimensions) => {
  let animateValues =
    mapValues({ width, height }, (value, layoutProp) => {
      return new Animated.Value(value)
    })

  if (side !== 'bottom') {
    animateValues.top = new Animated.Value(top)
  } else {
    animateValues.bottom = new Animated.Value(dimensions.height - top - height)
  }

  if (side !== 'right') {
    animateValues.left = new Animated.Value(left)
  } else {
    animateValues.right = new Animated.Value(dimensions.width - left - width)
  }

  let initialStyle = {
    ...resetStyle,
    ...animateValues,
  }

  // Removal does not have nextLayout
  let startAnimation = () => {
    return Animated.timing(animateValues[side], {
      duration: 200,
      toValue: (
        (side === 'top' || side === 'bottom')
        ? -height
        : -width
      ),
    })
  }

  return {
    props: {
      style: initialStyle,
    },
    start: startAnimation,
  }
}

export default slideOut
