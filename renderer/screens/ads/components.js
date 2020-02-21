/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {FiThumbsUp, FiThumbsDown} from 'react-icons/fi'
import {padding, margin, transparentize, triangle, position} from 'polished'
import {
  Table,
  TableRow,
  TableCol,
  TableHeaderCol,
  Box,
  TableHint,
  PageTitle,
  Heading,
  SubHeading,
  Text,
  Absolute,
} from '../../shared/components'
import theme, {rem} from '../../shared/theme'
import Flex from '../../shared/components/flex'
import Avatar from '../../shared/components/avatar'
import Layout from '../../shared/components/layout'
import Divider from '../../shared/components/divider'

export function Page({title, ...props}) {
  return (
    <Layout>
      <Box
        css={{
          ...padding(rem(24), rem(80)),
        }}
      >
        <PageTitle
          style={{
            ...padding(rem(theme.spacings.small8), 0),
            ...margin(0),
          }}
        >
          {title}
        </PageTitle>
        <Box
          css={{
            ...margin(rem(theme.spacings.medium16), 0, 0),
          }}
          {...props}
        />
      </Box>
    </Layout>
  )
}

export function Toolbar(props) {
  return <Flex align="top" justify="space-between" {...props} />
}

export function ToolbarGroup(props) {
  return <Flex {...props} />
}

export function ToolbarItem(props) {
  return <Box {...props} />
}

export function Figure(props) {
  return <Box {...props} />
}

export function FigureLabel(props) {
  return <Text color={theme.colors.muted} {...props} />
}

export function FigureNumber(props) {
  return (
    <SubHeading
      fontSize={rem(theme.fontSizes.large18)}
      fontWeight={theme.fontWeights.medium}
      {...props}
    />
  )
}

export function ToolbarButton(props) {
  return <Box {...props} />
}

export function TooltipDivider(props) {
  return <Divider vertical {...props} />
}

export function AdTable(props) {
  return (
    <Box
      css={{
        ...margin(rem(theme.spacings.medium32), 0, 0),
      }}
    >
      <Table {...props} />
    </Box>
  )
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

export function AdRow(props) {
  return <TableRow {...props} />
}

export function AdCell(props) {
  return <TableCol style={{border: 'none'}} {...props} />
}

export function AdImage({size = 32, css, style, ...props}) {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      style={{
        borderRadius: rem(theme.spacings.small8),
        border: `solid 1px ${transparentize(0.84, theme.colors.primary2)}`,
        height: rem(size),
        width: rem(size),
        ...css,
        ...style,
      }}
      {...props}
    />
  )
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

export function AdDetails({children, css, style, ...props}) {
  return (
    <AdRow>
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
    </AdRow>
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
    <Figure
      css={{
        ...margin(0, rem(theme.spacings.large64), 0, 0),
      }}
      {...props}
    >
      <FigureLabel fontSize={rem(11)}>{name}</FigureLabel>
      <FigureNumber fontSize={rem(11)}>{value}</FigureNumber>
    </Figure>
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
