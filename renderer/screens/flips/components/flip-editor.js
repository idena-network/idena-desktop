import React, {createRef} from 'react'
import PropTypes from 'prop-types'
import ImageEditor from '@toast-ui/react-image-editor'

function FlipEditor() {
  const editorRef = createRef()

  return (
    <ImageEditor
      ref={editorRef}
      includeUI={{
        loadImage: {
          path: '/static/128x128.png', // set image here, doesn't work with externals urls though :( like we have for defalt flips https://placehold.it/480?text=1
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
