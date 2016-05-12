import { mapValues } from 'lodash'
import { Animated } from 'react-native'

import { resetStyle, parallel, SetValue } from './utils'

let zero = {
  top: 0,
  left: 0,
  height: 0,
  width: 0,
}

let no_transition = (oldLayout = zero) => {
  let animateValues = mapValues(oldLayout, (value, layoutProp) => {
    return new Animated.Value(value)
  })

  let initialStyle = {
    ...resetStyle,
    ...animateValues,
  }

  let startAnimation = nextLayout => {
    return parallel(animateValues, (animatedValue, layoutProp) => {
      return SetValue(animatedValue, nextLayout[layoutProp])
    })
  }

  return {
    props: { style: initialStyle },
    start: startAnimation,
  }
}

export default no_transition
