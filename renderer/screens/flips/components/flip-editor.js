import React, {createRef} from 'react'
import PropTypes from 'prop-types'

const ImageEditor =
  typeof window !== 'undefined'
    ? require('@toast-ui/react-image-editor').default
    : null

function FlipEditor({src}) {
  const editorRef = createRef()

  return (
    <ImageEditor
      ref={editorRef}
      includeUI={{
        loadImage: {
          path: '/static/128x128.png' || src, // set image here, doesn't work with externals urls though :( like we have for defalt flips https://placehold.it/480?text=1
          name: 'DefaultImage',
        },
        // theme: myTheme,
        menu: ['shape', 'filter'],
        initMenu: 'filter',
        uiSize: {
          width: '480px',
          height: '360px',
        },
        menuBarPosition: 'bottom',
      }}
      cssMaxHeight={500}
      cssMaxWidth={700}
      selectionStyle={{
        cornerSize: 20,
        rotatingPointOffset: 70,
      }}
      usageStatistics={false}
    />
  )
}

FlipEditor.propTypes = {
  src: PropTypes.string,
}

export default FlipEditor
