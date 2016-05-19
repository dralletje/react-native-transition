import React, { PropTypes } from 'react'

import Scene from './Scene'
import scenePropTypes from './scenePropTypes'

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

let Contained = new Map()

class SceneContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      animatable: createAnimatable(),
    }
  }

  render() {
    let { transitions, render, ...props } = this.props
    let { animatable } = this.state

    if (render.prototype.render) {
      let ContainedComponent =
        Contained.has(render)
        ? Contained.get(render)
        : (
          class extends render {
            render() {
              return (
                <Scene
                  transitionConfig={transitions}
                  animatable={animatable}
                  children={super.render()}
                />
              )
            }
          }
        )

        Contained.set(render, ContainedComponent)

        return <ContainedComponent {...props} />
    }

    return (
      <Scene
        transitionConfig={transitions}
        animatable={animatable}
        children={render(props)}
      />
    )
  }
}

SceneContainer.propTypes = {
  transitions: scenePropTypes.transitionConfig,
  render: PropTypes.func.isRequired,
}

export default SceneContainer
