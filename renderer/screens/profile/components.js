/* eslint-disable react/prop-types */
import {
  Stack,
  Image,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/core'
import {TooltipX} from '../../shared/components'

export function UserPanel({address, state}) {
  return (
    <Stack isInline spacing={6} align="center" mb={6} width="480px">
      <Image
        size={80}
        src={`https://robohash.org/${address}`}
        bg="gray.50"
        marginRight={6}
        my={2}
        rounded="lg"
      />
      <Stack spacing={1}>
        <Heading
          as="h2"
          fontSize="lg"
          fontWeight="semibold"
          lineHeight="25px"
          wordBreak="break-all"
        >
          {state}
        </Heading>
        <Heading
          as="h3"
          fontSize="mdx"
          fontWeight="normal"
          color="muted"
          lineHeight="20px"
        >
          {address}
        </Heading>
      </Stack>
    </Stack>
  )
}

export function Figure({label, value, measure, tooltip}) {
  return (
    <Stat py={2}>
      <FigureLabel cursor={tooltip ? 'help' : 'auto'}>
        {tooltip ? (
          <TooltipX label={tooltip} placement="top" zIndex="tooltip">
            {label}
          </TooltipX>
        ) : (
          label
        )}
      </FigureLabel>
      {/* <FigureLabel>{label}</FigureLabel> */}
      <StatNumber fontSize="md" fontWeight={500} lineHeight="20px">
        {value} {measure}
      </StatNumber>
    </Stat>
  )
}

function FigureLabel(props) {
  return <StatLabel color="muted" fontSize="md" lineHeight="18px" {...props} />
}
