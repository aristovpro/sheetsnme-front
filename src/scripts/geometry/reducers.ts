import * as t from './types'

import * as a from './actions'

const MOBILE_WIDTH_MAX: number = 980

export const defaultState: t.GeometryState = {
  isMobile: defMobile(window.innerWidth),
}

export const geometry = (state = defaultState, action: a.GeometryActions) => {
  switch (action.type) {
    case a.RESIZE: {
      const {width} = action.payload
      return {
        ...state,
        isMobile: defMobile(width),
      }
    }

    default:
      return state
  }
}

export function defMobile(width: number): boolean {
  return width <= MOBILE_WIDTH_MAX
}
