import React from 'react'
import useValidation from '../utils/useValidation'

const ValidationStateContext = React.createContext()
const ValidationDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function ValidationProvider({children}) {
  const {
    shortAnswers,
    longAnswers,
    running: isRunning,
    submitShortAnswers,
    submitLongAnswers,
  } = useValidation()
  return (
    <ValidationStateContext.Provider
      value={{shortAnswers, longAnswers, isRunning}}
    >
      <ValidationDispatchContext.Provider
        value={{submitShortAnswers, submitLongAnswers}}
      >
        {children}
      </ValidationDispatchContext.Provider>
    </ValidationStateContext.Provider>
  )
}

function useValidationState() {
  const context = React.useContext(ValidationStateContext)
  if (context === undefined) {
    throw new Error(
      'useValidationState must be used within a ValidationProvider'
    )
  }
  return context
}

function useValidationDispatch() {
  const context = React.useContext(ValidationDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useValidationDispatch must be used within a ValidationProvider'
    )
  }
  return context
}

export {ValidationProvider, useValidationState, useValidationDispatch}
