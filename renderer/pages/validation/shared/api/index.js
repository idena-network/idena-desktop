/* eslint-disable import/prefer-default-export */
import {MOCK} from '../../../../shared/api/setup-api'

import * as validationApiRest from './validation-api'
import * as validationApiMock from './__mocks__/validation-api'

const validationApi = MOCK ? validationApiRest : validationApiMock

export {validationApi}
