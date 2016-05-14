import { Animated } from 'react-native'
import { mergeWith } from 'lodash'

// TODO: Show warning when props/style gets overwriten
let mergeProps = (prev, next, parentKey = '') => {
  return mergeWith(prev, next, (p, n, key) => {
    // No old value, so just set the new one and move on
    if (!p) {
      return n
    }

    // Conflicting values for one key
    // First try to merge if it's styles
    if (key === 'style' && parentKey === '') {
      return mergeProps(p, n, 'style.')
    } else {
      console.warn(`Two transitions try to set the same property (${parentKey}${key}).`)
      return n
    }
  })
}

let compose = (transitions) => context => {
  let { props, start } = transitions
  .map(transition => transition(context))
  .reduce((acc, cur) => {
    return {
      props: mergeProps(acc.props, cur.props),
      start: [
        ...acc.start,
        cur.start,
      ],
    }
  }, { props: {}, start: [] })

  let animation = newLayout => Animated.parallel(start.map(fn => fn(newLayout)).filter(Boolean))

  return {
    props,
    start: animation,
  }
}

export default compose
