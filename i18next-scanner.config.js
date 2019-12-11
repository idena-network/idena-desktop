const {AVAILABLE_LANGS} = require('./renderer/i18n')

module.exports = {
  input: ['renderer/**/*.{js,jsx}', '!**/node_modules/**'],
  output: './',
  options: {
    debug: true,
    trans: false,
    func: {
      list: ['t'],
      extensions: ['.js', '.jsx'],
    },
    lngs: AVAILABLE_LANGS,
    ns: ['error'],
    resource: {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      savePath: 'locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
    },
    nsSeparator: ':',
    keySeparator: false,
  },
}
