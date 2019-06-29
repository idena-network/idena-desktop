import React from 'react'
import theme from '../../../shared/theme'

export default function MessageForm() {
  return (
    <form>
      <input type="text" placeholder="Write something..." />
      <input type="submit" />
      <style jsx>{`
        form {
          border-top: solid 1px rgb(232, 234, 237);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1em;
        }
        input[type='text'] {
          border: none;
          border-radius: 8px;
          flex: 1;
          font-size: 1em;
          padding: 0.5em;
          outline: none;
        }
        input[type='submit'] {
          background: ${theme.colors.primary};
          color: ${theme.colors.gray};
          border: none;
          border-radius: 8px;
          font-size: 1em;
          padding: 0.5em;
          outline: none;
        }
      `}</style>
    </form>
  )
}
