/*
Give it children and an onLayout callback, and it will
render those outside of the view children and get the layout for the ones
that have an sceneKey property set :D
*/

import React from 'react';
import { View, Dimensions } from 'react-native';
import layout from 'css-layout'
import { mapValues } from 'lodash'

let dimensions = Dimensions.get('window');

let LayoutMeasurerExperimental = ({children, onLayout}) => {
  let scenes = {}
  let mapper = (child) => {
    // But it only cares about real react elements (not strings, not null)
    if (!child || !child.props) {
      return null
    }

    let result = {
      style: child.props.style,
      children: React.Children.map(child.props.children, mapper),
    }
    if (child.props.sceneKey) {
      scenes[child.props.sceneKey] = result
    }

    return result
  }
  let things = React.Children.map(children, mapper)

  layout({
    style: {
      top: 0,
      left: 0,
      width: dimensions.width,
      height: dimensions.height,
    },
    children: things,
  })

  onLayout(mapValues(scenes, ({ layout: { top, left, width, height } }) => {
    return { top, left, width, height }
  }))

  return <View />
}

export default LayoutMeasurerExperimental
