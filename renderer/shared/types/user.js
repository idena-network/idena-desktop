import PropTypes from 'prop-types'

export const scheme = PropTypes.shape({
  nick: PropTypes.string,
  name: PropTypes.string.isRequired,
  lastName: PropTypes.string,
  fullName: PropTypes.string,
})

export const initialState = {
  nick: '',
  name: '',
  lastName: '',
  fullName: '',
}

export default scheme
