export const Text = ({color, bold, children}) => (
  <span>
    {children}
    <style jsx>
      {`
        display: inline-block;
        padding: 0.5em 1em;
        margin: 0 0 0.5em;
        ${color && `color: ${color}`};
        ${bold && 'font-weight: bold'};
      `}
    </style>
  </span>
)

export default Text
