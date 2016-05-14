import { Animated } from 'react-native'
import { fromPairs } from 'lodash'
import invariant from 'invariant'

let styleTransition = propertiesToAnimate => ({ prevProps, nextProps }) => {
  let animation = new Animated.Value(0)

  invariant(prevProps.style, '[Style Transition] Previous element does not have a style prop')
  invariant(nextProps.style, '[Style Transition] Next element does not have a style prop')

  let style = fromPairs(propertiesToAnimate.map(key => {
    invariant(prevProps.style[key] !== undefined, `[Style Transition] Previous element style does not contain ${key} style`)
    invariant(nextProps.style[key] !== undefined, `[Style Transition] Next element style does not contain ${key} style`)

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
