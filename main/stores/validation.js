const Store = require('electron-store')

const store = new Store({
  name: 'validation',
})

/**
 * Get the current validation ceremony
 */
function getValidation() {
  return store.get('validation')
}

/**
 * Save validation object
 */
function saveValidation(validation) {
  return store.set('validation', validation)
}

/**
 * Save answers for a short session flips
 * @param {object[]} answers Answers given by candidate for a short session
 */
function saveShortAnswers(answers) {
  store.set('validation.shortAnswers', answers)
}

/**
 * Save answers for a long session flips
 * @param {object[]} answers Answers given by candidate for a long session
 */
function saveLongAnswers(answers) {
  store.set('validation.longAnswers', answers)
}

function deleteValidation() {
  store.delete('validation')
}

module.exports = {
  getValidation,
  saveValidation,
  saveShortAnswers,
  saveLongAnswers,
  deleteValidation,
}
