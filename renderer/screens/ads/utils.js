import {rgb} from 'polished'
import theme from '../../shared/theme'

export const AdRelevance = {
  Top: 'Top',
  Normal: 'Normal',
  Low: 'Low',
}

export const AdStatus = {
  Disabled: 'Disabled',
  Showing: 'Showing',
  PartiallyShowing: 'Partially showing',
  NotShowing: 'Not showing',
}

export function adStatusColor(status) {
  switch (status) {
    case AdStatus.Showing:
      return theme.colors.success
    case AdStatus.NotShowing:
      return theme.colors.danger
    case AdStatus.PartiallyShowing:
      return rgb(255, 163, 102)
    case AdStatus.Disabled:
      return theme.colors.muted
    default:
      return theme.colors.text
  }
}
