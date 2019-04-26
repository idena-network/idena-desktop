import PropTypes from 'prop-types'

export const scheme = {
  nick: PropTypes.string,
  name: PropTypes.string.isRequired,
  lastName: PropTypes.string,
  fullName: PropTypes.string.isRequired,
}

export const initialState = {
  nick: '',
  name: '',
  lastName: '',
  fullName: '',
}

export default scheme
