const Store = require('electron-store')

const store = new Store({
  name: 'validation',
})

/**
 * Sets the flag indicating validation has started
 * @param {number} durationInSec Validation duration, in sec
 */
function markValidationStarted(durationInSec) {
  store.set('validation.running', true)
  store.set('validation.ttl', durationInSec)
}

/**
 * Sets the flag indicating validation has ended
 */
function markValidationFinished() {
  store.set('validation.running', true)
}

/**
 * Gets the current validation ceremony
 */
function getCurrentValidation() {
  return store.get('validation')
}

/**
 * Saves answers for a short session flips
 * @param {object[]} answers Answers given by candidate for a short session
 */
function saveShortAnswers(answers) {
  store.set('validation.shortAnswers', answers)
}

/**
 * Saves answers for a long session flips
 * @param {object[]} answers Answers given by candidate for a long session
 */
function saveLongAnswers(answers) {
  store.set('validation.longAnswers', answers)
}

module.exports = {
  getCurrentValidation,
  markValidationStarted,
  markValidationFinished,
  saveShortAnswers,
  saveLongAnswers,
}
