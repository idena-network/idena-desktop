import theme from '../../theme'

export default () => (
  <div>
    <a href="/">Send message</a>
    <a href="/">Send coins</a>
    <a href="/">Block user</a>
    <style jsx>{`
      div {
        padding: 2em 1em;
      }
      a {
        color: ${theme.colors.primary};
        margin: 1em 2em 1em 0;
        text-decoration: none;
        position: relative;
      }
      a:not(:last-child)::after {
        content: '';
        background: rgb(232, 234, 237);
        width: 1px;
        position: absolute;
        top: -3px;
        right: -1em;
        bottom: -3px;
      }
    `}</style>
  </div>
)
