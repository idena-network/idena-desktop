import React from 'react'
import {Center} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'

export function OfflineBanner() {
  const {t} = useTranslation()

  return (
    <Center
      bg="red.500"
      fontWeight={500}
      lineHeight="5"
      py="3"
      w="full"
      position="absolute"
      top={0}
      left={0}
    >
      {t('Offline')}
    </Center>
  )
}
