import React from 'react'
import dedent from 'dedent-js'

let traverseScenes = (children, fn) => {
  // This function will run over every child in the tree
  let mapChildren = child => {
    // But it only cares about real react elements (not strings, not null)
    if (!child || !child.props) {
      return child
    }

    // and only if it has a sceneKey (We'll still look at the children)
    if (!child.props.sceneKey) {
      return React.cloneElement(child, {
        children: React.Children.map(child.props.children, mapChildren),
      })
    }

    // Warnings for when people are using refs
    if (typeof child.ref === 'string') {
      console.warn(dedent`
        Putting a (string) ref on react element with a sceneKey will not work.
        You have so on the element with sceneKey '${child.props.sceneKey}'.
      `)
    }
    if (typeof child.ref === 'function') {
      console.warn(dedent`
        Putting a ref on a react element with a sceneKey will not work,
        but it may in the future if you really need it, so let me know!
        Also, the component we are talking about has sceneKey '${child.props.sceneKey}'.
      `)
    }

    // Run the mapper function we got on this child's props and type
    let result = fn(child.props, child.type)

    // If there is no result, remove this child from the tree
    if (!result) {
      return null
    }

    // If you need a prop called "Component", well... good luck
    let { Component, ...newProps } = result

    // Map the new (or old) children with this same function
    let newChildren = React.Children.map(newProps.children || child.props.children, mapChildren)

    // We either clone the element, or make a totally new one if we need
    // to overwrite it's type
    if (Component) {
      return <Component {...child.props} {...newProps} children={newChildren} />
    } else {
      return React.cloneElement(child, { ...newProps, children: newChildren })
    }
  }

  // Start with the initial child (No reason to use React.Children.only here, is there? @TODO)
  return mapChildren(React.Children.only(children))
}

export default traverseScenes
