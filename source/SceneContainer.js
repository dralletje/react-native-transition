import React from 'react'
import { withState, withContext, compose } from 'recompose'

import contextTypes from './contextTypes'

let createAnimatable = () => {
  let layouts = null
  let props = null

  return {
    update: (nextLayouts, nextProps) => {
      layouts = nextLayouts
      props = nextProps
    },
    get: () => ({ layouts, props }),
  }
}

let SceneContainer = compose(
  withState('animatable', 'setAnimatable', createAnimatable)
,
  withContext(contextTypes, ({animatable, transitions}) => {
    return {
      animatable,
      transitionConfig: transitions,
    }
  })
)(class extends React.Component {
  render() {
    return this.props.children
  }
})

SceneContainer.propTypes = {
  transitions: contextTypes.transitionConfig,
}

export default SceneContainer
