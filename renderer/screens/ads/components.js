/* eslint-disable react/prop-types */
import React, {useState} from 'react'
import {
  Box,
  Divider,
  Flex,
  Image,
  Text,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {
  padding,
  margin,
  transparentize,
  triangle,
  position,
  backgrounds,
} from 'polished'
import {
  TableRow,
  TableCol,
  TableHeaderCol,
  Absolute,
} from '../../shared/components'
import theme, {rem} from '../../shared/theme'

export function Toolbar(props) {
  return <Flex mb={8} {...props} />
}

export function FigureGroup(props) {
  return <StatGroup {...props} />
}

export function Figure(props) {
  return <Stat {...props} />
}

export function FigureLabel(props) {
  return (
    <StatLabel color="muted" fontSize={rem(13)} fontWeight={400} {...props} />
  )
}

export function FigureNumber(props) {
  return (
    <StatNumber
      fontSize={rem(18)}
      fontWeight={500}
      minW={rem(116)}
      {...props}
    />
  )
}
export function SmallFigureLabel(props) {
  return <FigureLabel fontSize={rem(11)} {...props} />
}

export function SmallFigureNumber(props) {
  return <FigureNumber fontSize={rem(11)} {...props} />
}

export function ToolbarButton(props) {
  return <Box {...props} />
}

export function TooltipDivider(props) {
  return <Divider vertical {...props} />
}

export function AdList(props) {
  return <Stack {...props} />
}

export function AdHeader(props) {
  return (
    <thead>
      <TableRow {...props} />
    </thead>
  )
}

export function AdHeaderCell(props) {
  return <TableHeaderCol {...props} />
}

export function AdTableBody(props) {
  return <tbody {...props} />
}

export function AdEntry(props) {
  return <Box {...props} />
}

export function AdCell(props) {
  return <TableCol style={{border: 'none'}} {...props} />
}

export function AdImage(props) {
  return <Image rounded="lg" size="60px" {...props} />
}

export function AdEntryDivider(props) {
  return <Divider border="px" borderColor="gray.100" mb={0} {...props} />
}

export function AdRating(props) {
  return <Flex align="center" {...props} />
}

export function AdRatingButton({icon: Icon, ...props}) {
  return <Icon {...props} />
}

export function AdScore(props) {
  const {children: score} = props
  return (
    <Box
      bg={score < 0 ? theme.colors.danger01 : theme.colors.success01}
      color={score < 0 ? theme.colors.danger : theme.colors.success}
      css={{
        borderRadius: rem(6),
        fontWeight: theme.fontWeights.medium,
        ...padding(rem(theme.spacings.small8), rem(theme.spacings.medium16)),
        ...margin(0, rem(theme.spacings.small8)),
      }}
      {...props}
    >
      {score}
    </Box>
  )
}

export function AdTargeting(props) {
  return <Flex bg="gray.50" px={4} py={3} my={4} rounded="md" {...props}></Flex>
}

export function AdDetails({children, css, style, ...props}) {
  return (
    <AdEntry>
      <AdCell colspan={6} style={{border: 'none'}}>
        <Flex
          align="center"
          css={{
            border: `solid 1px ${theme.colors.gray2}`,
            borderRadius: rem(4),
            ...margin(0, 0, 0, rem(44)),
            ...padding(
              rem(theme.spacings.small4),
              rem(theme.spacings.small12),
              rem(theme.spacings.small8)
            ),
            ...position('relative'),
            ...css,
            ...style,
          }}
          {...props}
        >
          <Triangle
            size={theme.spacings.medium16}
            color={theme.colors.gray2}
            bg={theme.colors.white}
          />
          {children}
        </Flex>
      </AdCell>
    </AdEntry>
  )
}

export function AdStatus(props) {
  return (
    <Text
      fontWeight={500}
      css={{
        ...margin(0, rem(34), 0, 0),
        width: rem(98),
      }}
      {...props}
    />
  )
}

export function TargetCondition({name, value, ...props}) {
  return (
    <Flex {...props}>
      <FigureLabel fontSize={rem(11)} mr={2}>
        {name}
      </FigureLabel>
      <FigureNumber fontSize={rem(11)}>{value}</FigureNumber>
    </Flex>
  )
}

export function AdRowMenuItem({children, variant = 'text', ...props}) {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <Box
      style={{
        ...backgrounds(isHovered ? theme.colors.gray : ''),
        color: theme.colors[variant],
        cursor: 'pointer',
        fontWeight: theme.fontWeights.medium,
        ...padding(rem(6), rem(12)),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <Flex align="center" css={{display: 'inline-flex'}}>
        {children}
      </Flex>
    </Box>
  )
}

export function AdRowMenuIcon({icon: Icon, variant = 'primary', ...props}) {
  return (
    <Icon
      size={rem(16)}
      style={{...margin(0, rem(12), 0, 0)}}
      color={theme.colors[variant]}
      // eslint-disable-next-line react/destructuring-assignment
      aria-label={props.children}
      {...props}
    />
  )
}

export function EmptyAds() {
  const {t} = useTranslation()
  return (
    <div
      style={{
        color: theme.colors.muted,
        textAlign: 'center',
        lineHeight: '40vh',
      }}
    >
      {t(`You don't have any transactions yet`)}
    </div>
  )
}

export function Triangle({size, color, bg}) {
  return (
    <Absolute top={0} left={0}>
      <Absolute
        css={{
          ...triangle({
            pointingDirection: 'top',
            height: rem(size / 2),
            width: rem(size),
            foregroundColor: color,
          }),
          transform: `translate(${rem((size * 3) / 2)}, ${rem(-(size / 2))})`,
        }}
        top={0}
        left={0}
        zIndex={1}
      />
      <Absolute
        css={{
          ...triangle({
            pointingDirection: 'top',
            height: rem(size / 2 - 1),
            width: rem(size - 2),
            foregroundColor: bg,
          }),
          transform: `translate(${rem((size * 3) / 2 + 1)}, ${rem(
            -(size / 2) + 1
          )})`,
        }}
        top={0}
        left={0}
        zIndex={2}
      />
    </Absolute>
  )
}
