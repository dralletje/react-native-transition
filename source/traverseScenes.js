import React from 'react'

let traverseScenes = (children, fn) => {
  let mapChildren = child => {
    if (!child || !child.props) {
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
    return newKid
  }

  return mapChildren(React.Children.only(children))
}

export default traverseScenes
