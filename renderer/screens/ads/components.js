/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {FiThumbsUp, FiThumbsDown} from 'react-icons/fi'
import {padding, margin, transparentize} from 'polished'
import {
  Table,
  TableRow,
  TableCol,
  TableHeaderCol,
  Box,
  TableHint,
  PageTitle,
} from '../../shared/components'
import theme, {rem} from '../../shared/theme'
import Flex from '../../shared/components/flex'
import Avatar from '../../shared/components/avatar'
import Layout from '../../shared/components/layout'

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
            ...margin(rem(9), 0, rem(7)),
          }}
        >
          {title}
        </PageTitle>
        <Box
          css={{
            ...margin(rem(24), 0, 0),
          }}
          {...props}
        />
      </Box>
    </Layout>
  )
}

export function AdList(props) {
  const {t} = useTranslation()
  return (
    <div>
      <Table>
        <thead>
          <TableRow>
            <TableHeaderCol>{t('Ad/Author')}</TableHeaderCol>
            <TableHeaderCol>{t('Burnt, 24 hrs')}</TableHeaderCol>
            <TableHeaderCol>{t('Relevance')}</TableHeaderCol>
            <TableHeaderCol>{t('Rating')}</TableHeaderCol>
          </TableRow>
        </thead>
        <tbody {...props} />
      </Table>
    </div>
  )
}

export function AdListItem({
  imageUrl,
  title,
  address,
  burnt,
  relevance,
  score,
}) {
  return (
    <TableRow>
      <TableCol>
        <Flex align="center">
          <AdImage src={imageUrl || '//placekitten.com/40/40'} alt={title} />
          <Box>
            {title}
            <TableHint>
              <Avatar username={address} size={16} />
              {address}
            </TableHint>
          </Box>
        </Flex>
      </TableCol>
      <TableCol>{burnt} DNA</TableCol>
      <TableCol>{relevance}</TableCol>
      <TableCol>
        <Flex align="center">
          <FiThumbsUp />
          <AdScore score={score} />
          <FiThumbsDown />
        </Flex>
      </TableCol>
    </TableRow>
  )
}

export function AdImage(props) {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      style={{
        borderRadius: rem(8),
        border: `solid 1px ${transparentize(0.84, theme.colors.primary2)}`,
        height: rem(40),
        width: rem(40),
        marginRight: rem(8),
      }}
      {...props}
    />
  )
}

export function AdScore({score}) {
  return (
    <Box
      bg={score < 0 ? theme.colors.danger01 : theme.colors.success01}
      color={score < 0 ? theme.colors.danger : theme.colors.success}
      css={{
        borderRadius: rem(6),
        fontWeight: theme.fontWeights.medium,
        ...padding(rem(8), rem(16)),
        ...margin(0, rem(8)),
      }}
    >
      {score}
    </Box>
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
