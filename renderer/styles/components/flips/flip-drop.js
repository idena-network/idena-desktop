import css from 'styled-jsx/css'

export default css`
  aside {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: transparent;
    z-index: 9999;
    overflow: hidden;
  }

  section {
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    padding: 1em;
    width: 100%;
    pointer-events: none;
  }

  section.dark {
    background: #121212;
    color: #fff;
  }

  span {
    display: block;
    border: 1px dashed #d0d0d0;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-radius: 5px;
  }

  section.dark span {
    border-color: #444;
  }

  h1 {
    font-size: 16px;
    margin-bottom: 7px;
  }

  p {
    text-align: center;
    font-size: 12px;
    width: 250px;
    line-height: 20px;
    margin-top: -2px;
  }

  b {
    font-weight: 700;
  }
`
