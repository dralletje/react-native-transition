import { Animated } from 'react-native'
import { resetStyle } from './utils'

let slideOut = (side) => ({ prevLayout, window }) => {
  let horizontal = side === 'left' || side === 'right'
  let animateProp = horizontal ? 'left' : 'top'
  let selfSize = horizontal ? prevLayout.width : prevLayout.height
  let screenSize = horizontal ? window.width : window.height

  let animateValue = new Animated.Value(prevLayout[animateProp])

  let initialStyle = {
    ...resetStyle,
    ...prevLayout,
    [animateProp]: animateValue,
  }

  // Removal does not have nextLayout
  let startAnimation = () => {
    return Animated.timing(animateValue, {
      duration: 200,
      toValue: (
        side === 'right' || side === 'bottom'
        ? screenSize
        : selfSize
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
