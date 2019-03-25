export const Heading = ({children}) => (
  <h1>
    {children}
    <style jsx>{`
      h1 {
        color: rgb(83, 86, 92);
        font-size: 1.7em;
        margin: 0 0 2em;
      }
    `}</style>
  </h1>
)

export const SubHeading = ({children}) => (
  <h2>
    {children}
    <style jsx>{`
      h2 {
        color: rgb(83, 86, 92);
        font-size: 1.2em;
        margin: 0 0 0.5em;
      }
    `}</style>
  </h2>
)

export const Text = ({color, bold, padded, wrap, small, children}) => (
  <span>
    {children}
    <style jsx>{`
      span {
        display: inline-block;
        ${color && `color: ${color}`};
        ${bold && 'font-weight: bold'};
        ${padded &&
          `padding: 0.5em 1em;
        margin: 0 0 0.5em;`};
        ${wrap && `word-break: break-all;`};
        ${small && `font-size: 0.8em;`}
      }
    `}</style>
  </span>
)
