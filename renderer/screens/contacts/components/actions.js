import React from 'react'
import PropTypes from 'prop-types'
import {rem, rgba} from 'polished'
import theme from '../../../shared/theme'
import {FiShare} from 'react-icons/fi'

export const Actions = ({onInvite}) => (
  <div
    style={{
      paddingLeft: rem(theme.spacings.medium16),
      paddingRight: rem(theme.spacings.medium16),
      marginBottom: rem(theme.spacings.medium24),
    }}
  >
    <a href="/" className="share_button">
      <div className="share_button__icon">
        <FiShare />
      </div>
      <div className="share_button__content">
        <span className="share_button__title">Share Idena</span>
        <span className="share_button__accent">Unlimited</span>
      </div>
    </a>
    <style jsx>{`
      .share_button__icon {
        background-color: ${rgba(theme.colors.primary, 0.12)};
        color: ${theme.colors.primary};
        padding: ${rem(8)};
        margin-right: ${rem(12)};
        font-size: ${rem(20)};
        border-radius: ${rem(8)};
        float: left;
      }
      .share_button {
        background: none;
        border: none;
        color: ${theme.colors.primary};
        cursor: pointer;
        display: block;
        margin: 0 0 10px;
        padding: 0;
        text-decoration: none;
        overflow: hidden;
        letter-spacing: normal;
        width: 100%;
        text-align: left;
        outline: none;
      }
      .share_button__content {
        position: relative;
        padding-top: ${rem(5)};
      }
      .share_button__title {
        color: ${theme.colors.text};
        font-size: ${rem(15)};
        line-height: ${rem(15)};
        font-weight: ${theme.fontWeights.medium};
        display: block;
      }
      .share_button__accent {
        color: ${theme.colors.primary};
        font-size: ${rem(13)};
        line-height: ${rem(10)};
        font-weight: ${theme.fontWeights.medium};
      }
    `}</style>
  </div>
)

Actions.propTypes = {
  onInvite: PropTypes.func,
}

export default Actions
