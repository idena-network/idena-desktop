import css from 'styled-jsx/css'

export default css`
  .status {
    border-radius: 50%;
    display: inline-block;
    height: 1em;
    width: 1em;
    margin: 0 0.2em;
    vertical-align: middle;
  }
  .on {
    background: green;
  }
  .off {
    background: red;
    cursor: pointer;
  }
  pre {
    height: 200px;
    max-height: 200px;
    overflow: auto;
  }
`
