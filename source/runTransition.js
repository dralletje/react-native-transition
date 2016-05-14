import { Dimensions } from 'react-native'
import invariant from 'invariant'
import { no_transition } from './transitions'

let runTransition = (transitionConfig, transitionType, {
  layout = null, // Null in case of ENTER transition
  prevProps = null, // Also in case of ENTER transition
  nextProps = prevProps, // Extra convinient in case of a LEAVE transition,
  // Just need to make sure a leave transition won't fuck this up and use it,
  // But for now it helps with merging the styles.
}) => {
  // Find the transition using
  let transition = (() => {
    if (!transitionConfig) {
      return null // Use default
    }
    switch (transitionType) {
    case 'LEAVE':
      return transitionConfig.leave
    case 'ENTER':
      return transitionConfig.enter
    case 'CHANGE':
      return typeof transitionConfig === 'function' ? transitionConfig : transitionConfig.change
    default:
      invariant(false, 'The second argument to runTransition should be a transition type (LEAVE, ENTER, CHANGE).')
    }
  })() || no_transition // Still use no_transition as backup

  // Run the transition setup function
  let result = transition({
    prevProps,
    nextProps,
    prevLayout: layout,
    window: Dimensions.get('window'),
  })

  // Make sure the transition works alright
  invariant(result && result.props && result.start,
    `Transition function should return an object with shape { props, start } (in function ${transition.name}).`)

  let {
    props: { style: animStyle, ...animProps },
    start,
  } = result

  return {
    props: {
      ...nextProps,
      ...animProps,
      style: {
        ...nextProps.style,
        ...animStyle,
      },
    },
    startAnimation: start,
  }
}

export default runTransition
