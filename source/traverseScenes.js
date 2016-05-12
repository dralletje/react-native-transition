import React from 'react'

let traverseScenes = (children, fn, flatten = false) => {
  let flattenResult = []
  let mapChildren = child => {
    if (!child.props) {
      return child
    }

    if (!child.props.sceneKey) {
      return React.cloneElement(child, {
        children: React.Children.map(child.props.children, mapChildren),
      })
    }

    let newProps = fn(child.props)

    if (!newProps) {
      return null
    }

    let newKid = React.cloneElement(child, {
        ...newProps,
        children: React.Children.map(newProps.children || child.props.children, mapChildren),
      }
    )
    if (flatten) {
      flattenResult.push(newKid)
    } else {
      return newKid
    }
  }

  let result = mapChildren(React.Children.only(children))
  if (flatten) {
    return flattenResult
  } else {
    return result
  }
}

export default traverseScenes
