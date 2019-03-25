import React from 'react'

export const Row = ({justify, align = 'initial', children}) => (
  <div>
    {React.Children.map(children, child =>
      React.cloneElement(child, {
        w: child.props.w || 100 / React.Children.count(children),
      })
    )}
    <style jsx>{`
      div {
        display: flex;
        ${justify && `justify-content: ${justify}`};
        ${align && `align-items: ${align}`};
      }
    `}</style>
  </div>
)

export const Col = ({m, p, w, children}) => (
  <div>
    {children}
    <style jsx>{`
      div {
        display: block;
        ${m && `margin: ${m}`};
        ${p && `margin: ${p}`};
        width: ${w < 12 ? `${(w / 12) * 100}%` : `${w}%`};
      }
    `}</style>
  </div>
)
