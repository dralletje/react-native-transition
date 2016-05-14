import { Animated } from 'react-native'
import { fromPairs } from 'lodash'

let unanimatable = [
  'margin', 'marginLeft', 'marginRight',
  'marginTop', 'marginBottom',
  'top', 'left', 'right', 'left',
  'position',
]
let styleTransition = propertiesToAnimate => ({ prevProps, nextProps }) => {
  let animation = new Animated.Value(0)

  let style = fromPairs(propertiesToAnimate.map(key => {
    return [
      key,
      animation.interpolate({
        inputRange: [0, 1],
        outputRange: [prevProps.style[key], nextProps.style[key]],
      }),
    ]
  }))

  let startAnimation = () => {
    return Animated.timing(animation, {
      toValue: 1,
      duration: 200,
    })
  }

  return {
    props: { style },
    start: startAnimation,
  }
}

export default styleTransition
