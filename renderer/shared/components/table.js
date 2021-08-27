/* eslint-disable react/prop-types */
import React from 'react'
import {Box, useTheme} from '@chakra-ui/core'
import {rem} from '../theme'

export function Table({children, ...props}) {
  return (
    <table {...props}>
      {children}
      <style jsx>{`
        width: 100%;
        border-collapse: collapse;
      `}</style>
    </table>
  )
}

export function TableRow({children, ...props}) {
  return (
    <tr {...props}>
      {children}
      <style jsx>{`
        width: 100%;
      `}</style>
    </tr>
  )
}

export function TableCol({children, color, ...props}) {
  const {colors} = useTheme()

  return (
    <td {...props}>
      {children}
      <style jsx>{`
        td {
          padding: ${rem(8)} ${rem(12)};
          color: ${color || 'inherit'};
          border-bottom: 1px solid ${colors.gray[300]};
        }

        td.text-right {
          text-align: right;
        }
      `}</style>
    </td>
  )
}

export function TableHeaderCol({children, ...props}) {
  const {colors} = useTheme()
  return (
    <th {...props}>
      {children}
      <style jsx>{`
        th {
          color: ${colors.muted};
          font-weight: normal;
          background-color: ${colors.gray[50]};
          padding: ${rem(7)} ${rem(12)};
          text-align: left;
        }
        th:first-child {
          border-radius: ${rem(6)} 0 0 ${rem(6)};
        }
        th:last-child {
          border-radius: 0 ${rem(6)} ${rem(6)} 0;
        }
        th.text-right {
          text-align: right;
        }
      `}</style>
    </th>
  )
}

export function TableHint(props) {
  return <Box color="muted" fontSize="md" fontWeight={500} {...props} />
}
