import { sortBy } from 'lodash-es'
import { get } from 'theme-ui'
import { bindProps } from '../../lib/components'
import { Theme } from '../../types/theme'
import { randomInt } from '../../lib/util'
import GradientStopsField from '../inputs/Gradient/stops'
import { GradientStop } from '../inputs/Gradient/types'
import { functionSchema } from './function'
import { optionsSchema } from './options'
import { position } from './position'
import { angle, color, keyword } from './primitives'
import { DataTypeSchema } from './types'

export const stringifyStops = (stops: GradientStop[], unit: string = '%', theme?: Theme) => {
  return sortBy(stops, (stop) => stop.hinting)
    ?.filter(Boolean)
    ?.map(({ color, hinting }) => {
      let resolved = get((theme || {}), color.themePath, color)
      return `${resolved.value} ${hinting}${unit}`
    })
    ?.join(', ')
}

function stops(repeating: boolean = false): DataTypeSchema<GradientStop[]> {
  return {
    input: bindProps(GradientStopsField, { repeating }),
    stringify: (value, theme) => stringifyStops(value, '%', theme),
    defaultValue: [
      { color: { value: 'black' }, hinting: 0 },
      { color: { value: 'transparent' }, hinting: 100 },
    ],
    regenerate({ previousValue }) {
      const newStops = previousValue.map(() => randomInt(0, 101))
      newStops.sort()
      return newStops.map((hinting) => {
        return {
          hinting,
          color: color().regenerate!({ previousValue: 'black' }),
        }
      })
    },
  }
}

const directions = [
  'to left',
  'to right',
  'to top',
  'to bottom',
  'to top left',
  'to top right',
  'to bottom right',
  'to bottom left',
] as const

const linear = functionSchema('linear-gradient', {
  fields: {
    angle: angle({ keywords: directions }),
    stops: stops(),
  },
})
const repeatingLinear = functionSchema('repeating-linear-gradient', {
  fields: {
    angle: angle({ keywords: directions }),
    stops: stops(true),
  },
})

const radial = functionSchema('radial-gradient', {
  fields: {
    shape: keyword(['circle', 'ellipse']),
    // TODO length sizes
    size: keyword([
      'farthest-corner',
      'nearest-corner',
      'farthest-side',
      'nearest-side',
    ]),
    position,
    stops: stops(),
  },
  stringify: ({ shape, size, position, stops }) =>
    `${shape} ${size} at ${position}, ${stops}`,
})

const repeatingRadial = functionSchema('repeating-radial-gradient', {
  fields: {
    shape: keyword(['circle', 'ellipse']),
    size: keyword([
      'farthest-corner',
      'nearest-corner',
      'farthest-side',
      'nearest-side',
    ]),
    position,
    stops: stops(true),
  },
  stringify: ({ shape, size, position, stops }) =>
    `${shape} ${size} at ${position}, ${stops}`,
})

const conic = functionSchema('conic-gradient', {
  fields: {
    angle: angle(),
    position,
    stops: stops(),
  },
  stringify: ({ angle, position, stops }) =>
    `from ${angle} at ${position}, ${stops}`,
})
const repeatingConic = functionSchema('repeating-conic-gradient', {
  fields: {
    angle: angle(),
    position,
    stops: stops(true),
  },
  stringify: ({ angle, position, stops }) =>
    `from ${angle} at ${position}, ${stops}`,
})

export const gradient = optionsSchema({
  variants: {
    linear,
    'repeating-linear': repeatingLinear,
    radial,
    'repeating-radial': repeatingRadial,
    conic,
    'repeating-conic': repeatingConic,
  },
  // TODO keep values when switching between repeating and non-
  convert: (oldValue, newType) => {
    if (
      oldValue.type === `repeating-${newType}` ||
      newType === `repeating-${oldValue.type}`
    ) {
      return oldValue
    }
    return {
      stops: oldValue.stops,
    }
  },
})
