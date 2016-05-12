import { Animated } from 'react-native'
import { map } from 'lodash'

export let parallel = (collection, fn = x => x) => Animated.parallel(map(collection, fn))

// Need to remove margin and set position to absolute,
// else it'll fuck with our positioning
export let resetStyle = {
  position: 'absolute',
  margin: 0,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
}

export let SetValue = (animatedValue, value) => {
  return {
    start: (cb) => {
      animatedValue.setValue(value)
      cb({ finished: true })
    },
    stop: () => {},
  }
}
