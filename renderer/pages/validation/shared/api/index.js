/* eslint-disable import/prefer-default-export */
import {MOCK} from '../../../../shared/api/api-client'

import * as validationApiRest from './validation-api'
import * as validationApiMock from './__mocks__/validation-api'

const validationApi = MOCK ? validationApiRest : validationApiMock

export {validationApi}
