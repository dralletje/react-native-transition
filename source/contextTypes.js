import { PropTypes } from 'react'

let contextTypes = {
  animatable: PropTypes.object,
  transitionConfig: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        enter: PropTypes.func,
        change: PropTypes.func,
        leave: PropTypes.func,
      }),
      PropTypes.func,
    ]).isRequired
  ).isRequired,
}

export default contextTypes
