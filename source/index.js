import React from 'react'
import { Animated, View, Dimensions } from 'react-native'
import Promise from 'bluebird'
import invariant from 'invariant'
import { difference, xor } from 'lodash'

import { withState, withContext, getContext, compose } from 'recompose'
import defer from './defer'
import LayoutMeasurer from './LayoutMeasurer'
import traverseScenes from './traverseScenes'

// Import and export transitions
import transitions from './transitions'
let { no_transition } = transitions
export { transitions }

let contextTypes = {
  animatable: React.PropTypes.object,
  transitions: React.PropTypes.object,
}

let createAnimatable = () => {
  console.log('Create only once')
  let layouts = null
  let props = null

  return {
    setLayouts: (newLayouts) => {
      layouts = newLayouts
    },
    layouts: () => layouts,
    setProps: (nextProps) => {
      props = nextProps
    },
    props: () => props,
  }
}

const SIDE_BY_SIDE = true

/*
1. Opmeten nieuwe screen buiten het scherm
2. Render nieuwe screen met
  - values van het oude scherm bij nog steeds bestaande sceneKeys (misschien zelfs the native Views behouden)
  - Values van hun manier van infaden op nieuwe sceneKeys
  - Values van, en de 'the actual elements', van het oude scherm die verwijderd zijn
    neerzetten op hun oude plek
3. Start animatie naar nieuwe opgemeten scherm
*/

let SceneContainer = compose(
  withState('animatable', 'setAnimatable', createAnimatable)
,
  withContext(contextTypes, ({animatable, transitions}) => {
    return { animatable, transitions }
  })
)(class extends React.Component {
  render() {
    return this.props.children
  }
})

let Scene = getContext(contextTypes)(class extends React.Component {
  constructor(props) {
    super(props)
    this.layouts = null
  }

  // TODO: PR React Native to make the setTimeout here unecesarry
  resolveStuff() {
    // Promise.props(
    //   mapValues(this.layouts, layout => layout.then(ref => {
    //     return new Promise(yell => {
    //       setTimeout(() => {
    //         ref.measureInWindow((x, y, width, height) => {
    //           yell({ x, y, width, height })
    //         })
    //       })
    //     })
    //   }))
    // ).then(layouts => {
    //   this.props.animatable.setLayouts(layouts)
    // })
  }

  componentDidMount() {
    this.resolveStuff()
  }
  // componentWillMount() {
  //   console.log('componentWillMount')
  // }
  //
  // componentDidUpdate() {
  //   console.log('ComponentDidUpdate')
  //   this.resolveStuff()
  // }

  render() {
    let { children, animatable, transitions } = this.props
    let oldLayout = animatable.layouts()
    let oldPropsCollection = animatable.props()

    if (!oldLayout) {
      // Save props for possible deletion
      let propsCollection = {}
      traverseScenes(children, ({ sceneKey, ...props }) => {
        invariant(!propsCollection[sceneKey], `Two children with sceneKey '${sceneKey}'`)
        propsCollection[sceneKey] = props
      })
      return (
        <Framework
          onLayout={realLayouts => {
            animatable.setLayouts(realLayouts)
            animatable.setProps(propsCollection)
          }}
          children={children}
        />
      )
    }

    let refs = {}
    let propsCollection = {}

    let startAnimation = (realLayouts) => {
      animatable.setLayouts(realLayouts)
      animatable.setProps(propsCollection)

      Promise.props(refs)
      .then(realRefs => {
        let animations = Object.keys(realRefs).map(key => {
          return realRefs[key].startAnimation(realLayouts[key]) || null
        })
        .filter(Boolean)
        Animated.parallel(animations).start()
      })
    }

    let newChildren = traverseScenes(children, ({ sceneKey, ...props }) => {
      invariant(!refs[sceneKey], `Two children with sceneKey '${sceneKey}'`)

      let deferred = defer()
      refs[sceneKey] = deferred.promise
      propsCollection[sceneKey] = props

      return {
        oldLayout: oldLayout[sceneKey],
        animated: true,
        transition: transitions[sceneKey],
        sceneRef: ref => {
          deferred.resolve(ref)
        },
      }
    })

    let sceneKeys = Object.keys(refs)

    let removedKeys = difference(Object.keys(oldLayout), sceneKeys)
    let childrenToBeRemoved = removedKeys
    .filter(sceneKey => {
      let transition = transitions[sceneKey]
      return transition && typeof transition.leave === 'function'
    })
    .map(sceneKey => {
      let deferred = defer()
      refs[sceneKey] = deferred.promise
      return (
        <SceneProp
          {...oldPropsCollection[sceneKey]}
          oldLayout={oldLayout[sceneKey]}
          animated={true}
          isDeletion={true}
          transition={transitions[sceneKey]}
          key={sceneKey}
          sceneRef={ref => {
            deferred.resolve(ref)
          }}
        />
      )
    })

    // Make sure no keys are added or removed inside one scene.
    // For sanity, now
    // if (this.layouts) {
    //   let xor_result = xor(sceneKeys, Object.keys(this.layouts))
    //   invariant(xor_result.length === 0, `Keys added or removed in same component: ${xor_result.join(', ')}`)
    // }
    this.layouts = refs


    return (
      <Framework
        onLayout={startAnimation}
        children={children}
        newChildren={newChildren}
        childrenToBeRemoved={childrenToBeRemoved}
      />
    )
  }
})

let Framework = ({
  onLayout, children,
  childrenToBeRemoved, newChildren = children,
}) => {
  if (!SIDE_BY_SIDE) {
    return (
      <View style={{ flex: 1 }}>
        {/* Start measuring the end result */}
        <LayoutMeasurer
          onLayout={onLayout}
          children={children}
        />
        {/* Render the new scene */}

        { newChildren }
        { childrenToBeRemoved }
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Start measuring the end result */}
      <LayoutMeasurer
        onLayout={onLayout}
        children={children}
        timesScreenWidth={0.5}
      />
      {/* Render the new scene */}
      <View
        style={{
          flex: 1,
          width: Dimensions.get('window').width / 2,
          borderRightWidth: 1,
          borderRightColor: 'black',
          overflow: 'hidden',
        }}
      >
        { newChildren }
        { childrenToBeRemoved }
      </View>
    </View>
  )
}

let SceneProp = ({
  sceneRef, style,
  oldLayout, isDeletion = false,
  transition: _transition = no_transition,
  animated = false,
  ...props,
}) => {
  if (!animated) {
    return <View ref={sceneRef} style={style} {...props } />
  }

  let transition =
    typeof _transition === 'function'
    ? _transition
    : _transition.change

  if (!oldLayout) {
    transition = _transition.enter
  }
  if (isDeletion) {
    transition = _transition.leave
  }

  let transitionWithDefault = transition || no_transition

  // TODO: Maybe pass in children for keeping them alive till the end of the transition
  let {
    props: { style: animStyle, ...animProps },
    start,
  } = transitionWithDefault(oldLayout, Dimensions.get('window'))

  return (
    <Animated.View
      {...props}
      {...animProps}
      style={{
        ...style,
        ...animStyle,
      }}
      ref={ref => {
        if (ref === null) {
          return
        }
        sceneRef && sceneRef({ ref, startAnimation: start })
      }}
    />
  )
}

export { Scene, SceneContainer, SceneProp }
