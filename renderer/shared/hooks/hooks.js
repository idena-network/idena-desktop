import {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {toLocaleDna} from '../utils/utils'

export function useFormatDna(options) {
  const {
    i18n: {language},
  } = useTranslation()

  return useCallback(
    (value) => toLocaleDna(language, options)(value),
    [language, options]
  )
}
