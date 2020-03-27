import React from 'react'
import {margin, padding, rem, wordWrap} from 'polished'
import PropTypes from 'prop-types'
import {FiLoader} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'
import theme from '../../../shared/theme'
import {
  Box,
  Button,
  Field,
  FormGroup,
  SubHeading,
  Text,
} from '../../../shared/components'
import FlipImage from './flip-image'
import Flex from '../../../shared/components/flex'

function DeleteFlipForm({hash, pic, onDelete}) {
  const {t} = useTranslation('error')

  const [submitting, setSubmitting] = React.useState(false)

  return (
    <Box
      css={padding(rem(theme.spacings.large48), rem(theme.spacings.medium32))}
    >
      <Box
        css={{
          ...margin(theme.spacings.medium16, 0, theme.spacings.medium32),
        }}
      >
        <SubHeading
          css={{...margin(0, 0, theme.spacings.small8), ...wordWrap()}}
        >
          {t(`translation:Delete flip`)}
        </SubHeading>
        <Text>
          {t(`translation:Deleted flip will be moved to the drafts.`)}
        </Text>
        <Flex align="center" justify="center">
          <FlipImage src={pic} />
        </Flex>

        <FormGroup>
          <Field
            label={t('translation:Flip hash')}
            defaultValue={hash}
            disabled
          />
        </FormGroup>
        <FormGroup
          css={margin(rem(theme.spacings.medium24), 0, 0)}
          className="text-right"
        >
          <Button
            danger
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true)
              const ok = await onDelete()
              if (!ok) {
                setSubmitting(false)
              }
            }}
          >
            {submitting ? <FiLoader /> : t('translation:Delete')}
          </Button>
        </FormGroup>
      </Box>
    </Box>
  )
}

DeleteFlipForm.propTypes = {
  hash: PropTypes.string,
  onDelete: PropTypes.func,
  pic: PropTypes.string,
}

export default DeleteFlipForm
