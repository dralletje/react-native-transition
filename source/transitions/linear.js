import invariant from 'invariant'
import { mapValues } from 'lodash'
import { Animated, Easing } from 'react-native'

import { resetStyle, parallel, SetValue } from './utils'

let sides = {
  vertical: { top: true, height: true },
  horizontal: { left: true, width: true },
  both:  { top: true, height: true,  left: true, width: true },
}

let linear = (side = 'both') => (oldLayout) => {
  let sideProps = sides[side]
  invariant(sideProps, 'First argument to `linear` must be either `horizontal`, `vertical` or `both`.')

  let animateValues =
    mapValues(oldLayout, (value, layoutProp) => {
      return new Animated.Value(value)
    })

  let initialStyle = {
    ...resetStyle,
    ...animateValues,
  }

  return {
    props: {
      style: initialStyle,
    },
    start: (nextLayout) => {
      return parallel(animateValues, (animatedValue, layoutProp) => {
        if (sideProps[layoutProp]) {
          return Animated.timing(animatedValue, {
            toValue: nextLayout[layoutProp],
            easing: Easing.inOut(Easing.ease),
            duration: 200,
          })
        } else {
          return SetValue(animatedValue, nextLayout[layoutProp])
        }
      })
    },
  }
}

export default linear
