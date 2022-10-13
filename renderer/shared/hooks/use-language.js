import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {isoLangs} from '../../i18n'

export function useLanguage() {
  const {i18n} = useTranslation()
  const [lng, setLng] = useState('en')

  useEffect(() => {
    setLng(new Intl.Locale(i18n.language || 'en').language)
  }, [i18n.language])

  return {lng, isoLng: isoLangs[lng].nativeName}
}
