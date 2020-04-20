import * as t from './types'

import React from 'react'
import ReactDom from 'react-dom'

// @ts-ignore
import * as f from 'fpx'
// @ts-ignore
import * as emerge from 'emerge'
import * as querystring from 'querystring'

export const MOBILE_WIDTH_MAX = 980
export const DEFAULT_PAGE_SIZE = 25

/**
 * React-specific
 */

export const Context: React.Context<t.AppContext> = React.createContext<t.AppContext>({})

export class ViewComponent<P = any, S = any> extends React.Component<P, S> {
  static contextType: React.Context<t.AppContext> = Context
  // static contextType<t.AppContext> = Context

  constructor(props: P, context?: t.AppContext) {
    super(props, context)
    // this.render = renderWithArg
  }
}

// function renderWithArg() {
//   // Minor convenience: pass self as argument.
//   return this.constructor.prototype.render.call(this, this)
// }

export function findDomNode(element) {
  element = ReactDom.findDOMNode(element)
  if (element != null) f.validate(element, isElement)
  return element
}

function isComponent(value) {
  return f.isInstance(value, React.Component)
}

export function bindValue(component, path, fun) {
  f.validate(component, isComponent)
  f.validate(path, isPath)

  return {
    onUpdate: value => {
      component.setState(emerge.putIn(component.state, path, f.isFunction(fun) ? fun(value) : value))
    },
    value: f.getIn(component.state, path) || '',
  }
}

export function bindChecked(component, path, componentValue) {
  f.validate(component, isComponent)
  f.validate(path, isPath)

  return {
    onUpdate: value => {
      component.setState(emerge.putIn(component.state, path, value))
    },
    value: componentValue,
    checked: f.getIn(component.state, path) === componentValue,
  }
}



/**
 * Dom
 */

export function isNode(value) {
  return f.isInstance(value, Node)
}

export function isElement(value) {
  return f.isInstance(value, Element)
}

export function isAncestorOf(maybeAncestor, maybeDescendant) {
  return (
    isNode(maybeAncestor) &&
    isNode(maybeDescendant) && (
      maybeAncestor === maybeDescendant ||
      isAncestorOf(maybeAncestor, maybeDescendant.parentNode)
    )
  )
}

// Note: we map `event.keyCode` to names instead of using `event.key` because
// the latter is not consistently supported across engines, particularly Webkit.
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key#Browser_compatibility
const KEY_NAMES_US = {
  8:  'Backspace',
  9:  'Tab',
  13: 'Enter',
  27: 'Escape',
  32: 'Space',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  74: 'j',
  75: 'k',
}

export function eventKeyName({keyCode}) {
  return KEY_NAMES_US[keyCode]
}

export function addEvent(target, name, fun, useCapture = false) {
  f.validate(fun, f.isFunction)
  f.validate(useCapture, f.isBoolean)

  target.addEventListener(name, fun, useCapture)

  return function removeEvent() {
    target.removeEventListener(name, fun, useCapture)
  }
}

export function preventDefault(event) {
  if (event && event.preventDefault) event.preventDefault()
}

export function stopPropagation(event) {
  if (event && event.stopPropagation) event.stopPropagation()
}

export function geometry (width) {
  return {isMobile: width <= MOBILE_WIDTH_MAX}
}

export function isMobile(context) {
  return context.isMobile
}

// Measures the CURRENT width of the body scrollbar. Returns ZERO if the body
// doesn't currently have a scrollbar. This relies on the fact that in our CSS,
// we always set `overflow-y: scroll` for the body, which allows to avoid layout
// shifting when navigating between pages that overflow and ones that don't.
export function getGlobalScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth
}



/**
 * Format
 */

export function toValidDate(value) {
  // Gotcha: `new Date(null)` ≡ `new Date(0)`
  if (value == null) return undefined
  const date = new Date(value)
  return f.isValidDate(date) ? date : undefined
}

export function dateIsoString(value) {
  const date = toValidDate(value)
  return date ? date.toISOString() : ''
}

export function formatDate(value) {
  const match = dateIsoString(value).match(/(\d\d\d\d-\d\d-\d\d)/)
  return match ? match[1] : ''
}

export function addBrowserOffset(date) {
  if (!f.isValidDate(date)) return undefined
  date.setTime(date.getTime() - (date.getTimezoneOffset() * 60 * 1000))
  return date
}

export function daysInMonth(year, month) {
  f.validate(year, f.isNatural)
  f.validate(month, isMonthNumber)
  return new Date(year, month + 1, 0).getDate()
}

function isMonthNumber(month) {
  return f.isNatural(month) && month >= 0 && month <= 11
}

export function daysInMonthList(year, month) {
  return year != null && month != null
    ? f.range(1, daysInMonth(year, month) + 1)
    : f.range(1, 32)
}

export function parseNum(value) {
  if (f.isString(value)) value = parseFloat(value, 10)
  if (f.isFinite(value)) return value
  return undefined
}

/**
 * Net
 */

export function jsonParams(params: void | t.JsonParams): t.XHttpParams {
  return emerge.merge(params, {headers: jsonHeaders})
}

const jsonHeaders = {
  accept: 'application/json',
  'content-type': 'application/json',
}

export const langHeaders = lang => ({[window.VARS.LANG_HEADER_NAME]: lang})



/**
 * Local storage
 *
 * Accessing localStorage may throw an error depending on browser / device /
 * browsing mode. For instance, writing to LS throws in Safari (iOS / OS X) in
 * private mode. We ignore all storage errors.
 */

// TODO Move to env.properties
const STORAGE_KEY = 'data'

export const storage = initStorage() || {}

function initStorage () {
  try {return localStorage}
  catch (err) {
    console.warn('Failed to initialise localStorage:', err)
    return undefined
  }
}

export function storageRead (path) {
  f.validate(path, isPath)
  try {
    if (!storage[STORAGE_KEY]) return undefined
    return emerge.getIn(JSON.parse(storage[STORAGE_KEY]), path)
  }
  catch (err) {
    console.warn('Failed to read from storage:', err)
    return undefined
  }
}

export function storageWrite (path, value) {
  f.validate(path, isPath)

  try {storage[STORAGE_KEY] = JSON.stringify(emerge.putIn(storageRead([]), path, value))}
  catch (err) {
    console.warn('Failed to save to storage:', err)
  }
}



/**
 * i18n
 */

export const AVAILABLE_LANGS = ['en', 'ru']

export const QUERY_LANG = f.intersection(
  [decodeQuery(window.location.search).lang],
  AVAILABLE_LANGS,
)[0]

export const DEFAULT_LANG = f.intersection(
  window.navigator.languages.map(langPrefix),
  AVAILABLE_LANGS,
)[0] || AVAILABLE_LANGS[0]

function langPrefix(langCode) {return langCode.split('-')[0]}

export function xln(context, translations, args) {
  f.validate(context, f.isObject)

  if (translations == null) return ''
  f.validate(translations, f.isDict)

  let translation
  if (translations[context.lang]) {
    translation = translations[context.lang]
  }
  else if (translations[DEFAULT_LANG]) {
    translation = translations[DEFAULT_LANG]
  }
  else {
    for (const lang in translations) {
      if (translations[lang]) {
        translation = translations[lang]
        break
      }
    }
  }

  return f.isFunction(translation) ? translation(...args) : (translation || '')
}

export function nextLang(context) {
  f.validate(context, f.isObject)

  const lang = context.lang || DEFAULT_LANG
  const nextIndex = (AVAILABLE_LANGS.indexOf(lang) + 1) % AVAILABLE_LANGS.length
  return AVAILABLE_LANGS[nextIndex] || DEFAULT_LANG
}



/**
 * Location
 */

export function decodeQuery(searchString) {
  return querystring.decode((searchString || '').replace(/^[?]/, ''))
}

export function encodeQuery(query) {
  return prepend('?', querystring.encode(f.omitBy(query, value => !value)))
}

export function prepend(char, value) {
  f.validate(char, f.isString)
  if (value == null || value === '') return ''
  f.validate(value, f.isString)
  return value[0] === char ? value : char + value
}



/**
 * Misc
 */

// Note: if the URL contains spaces or other non-URL characters, it must be
// URL-encoded before calling this function. We can't encode them
// indiscriminately, because that would wreck some valid URLs.
export function bgUrl(url) {
  if (url == null || url === '') return undefined
  f.validate(url, f.isString)
  return {backgroundImage: `url(${url})`}
}

function isPath (value) {
  return f.isList(value) && f.every(value, f.isKey)
}

export function omitEmpty(dict) {
  return f.omitBy(dict, value => {
    return f.isArray(value) || f.isDict(value)
      ? f.isEmpty(value)
      : f.isString(value)
      ? !value
      : f.isDate(value)
      ? !value
      : value == null
  })
}
