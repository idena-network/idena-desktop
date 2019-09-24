import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import theme from '../theme'

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

Table.propTypes = {
  children: PropTypes.node,
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

TableRow.propTypes = {
  children: PropTypes.node,
}

export function TableCol({children, color, ...props}) {
  return (
    <td {...props}>
      {children}
      <style jsx>{`
        padding: ${rem(7)} ${rem(12)};
        color: ${color || 'inherit'};
      `}</style>
    </td>
  )
}

TableCol.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
}

export function TableHeaderCol({children, ...props}) {
  return (
    <th {...props}>
      {children}
      <style jsx>{`
        th {
          color: ${theme.colors.muted};
          font-weight: normal;
          background-color: ${theme.colors.gray};
          padding: ${rem(7)} ${rem(12)};
          text-align: left;
        }
        th:first-child {
          border-radius: ${rem(6)} 0 0 ${rem(6)};
        }
        th:last-child {
          border-radius: 0 ${rem(6)} ${rem(6)} 0;
        }
      `}</style>
    </th>
  )
}

TableHeaderCol.propTypes = {
  children: PropTypes.node,
}

export function RowStatus({up, walletName, ...props}) {
  return (
    <div {...props} className="status">
      <div className="icon">

      </div>
      <div className="content">
        <div className="">Received</div>
        <div className="">Main</div>
      </div>
      <style jsx>{`

      `}</style>
    </div>
  )
}

RowStatus.propTypes = {
  up: PropTypes.bool,
  walletName: PropTypes.string,
}
