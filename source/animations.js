import invariant from 'invariant'
import { map, mapValues } from 'lodash'
import { Animated, Easing } from 'react-native'

let parallel = (collection, fn = x => x) => Animated.parallel(map(collection, fn))

// Need to remove margin and set position to absolute,
// else it'll fuck with our positioning
let resetStyle = {
  position: 'absolute',
  margin: 0,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
}

let SetValue = (animatedValue, value) => {
  return {
    start: (cb) => {
      animatedValue.setValue(value)
      cb({
        finished: true,
      })
    },
    stop: () => {},
  }
}

let zero = {
  top: 0,
  left: 0,
  height: 0,
  width: 0,
}

export let no_transition = (oldLayout = zero) => {
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

// Creation does not have oldLayout
export let slideIn = (side) => () => {
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

export let slideOut = (side) => ({ top, left, width, height }, dimensions) => {
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
    return Animated.spring(animateValues[side], {
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

let sides = {
  vertical: { top: true, height: true },
  horizontal: { left: true, width: true },
  both:  { top: true, height: true,  left: true, width: true },
}

export let linear = (side = 'both') => (oldLayout) => {
  let animateValues =
    mapValues(oldLayout, (value, layoutProp) => {
      return new Animated.Value(value)
    })

  let initialStyle = {
    ...resetStyle,
    ...animateValues,
  }

  let sideProps = sides[side]
  invariant(sideProps, 'First argument to `linear` must be either `horizontal`, `vertical` or `both`.')

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
