import * as t from '../types'

import * as n from '../net'
import * as pa from '../pending/actions'

export type CategoryActions = ReceiveCategories | ReceiveCategoriesSpendings


export const RECEIVE_CATEGORIES = 'RECEIVE_CATEGORIES'

interface ReceiveCategories extends t.ReduxAction {
  type: typeof RECEIVE_CATEGORIES,
  payload: {
    categoryList: t.CategoryListRes,
  },
}

function receiveCategories(
  categoryList: t.CategoryListRes
): ReceiveCategories {
  return {
    type: RECEIVE_CATEGORIES,
    payload: {
      categoryList,
    },
  }
}


export function fetchCategories(
  message: string
): t.ReduxThunkAction<Promise<t.CategoryListRes>> {
  return (dispatch) => {
    return dispatch(pa.trackRequest({
      message,
      requestName: 'getCategories',
      promise: n.authedJsonFetch<t.CategoryListRes>('/api/categories'),
    }))
      .then((categories) => {
        dispatch(receiveCategories(categories))
        return categories
      })
  }
}

export function createCategory(
  category: t.CategoryReq,
  message: string
): t.ReduxThunkAction<Promise<t.CategoryRes>> {
  return (dispatch) => {
    return dispatch(pa.trackRequest({
      message,
      requestName: 'postCategory',
      promise: n.authedJsonFetch<t.CategoryRes>('/api/categories', {
        method: 'POST',
        body: category,
      }),
    }))
  }
}

export function updateCategory(
  id: string,
  category: t.CategoryReq,
  message: string,
): t.ReduxThunkAction<Promise<t.CategoryRes>> {
  return (dispatch) => {
    return dispatch(pa.trackRequest({
      message,
      requestName: 'postCategory',
      promise: n.authedJsonFetch<t.CategoryRes>(`/api/categories/${id}`, {
        method: 'POST',
        body: category,
      }),
    }))
  }
}

export function deleteCategory(
  id: string,
  message: string
): t.ReduxThunkAction<Promise<t.CategoryRes>> {
  return (dispatch) => {
    return dispatch(pa.trackRequest({
      message,
      requestName: 'deleteCategory',
      promise: n.authedJsonFetch<t.CategoryRes>(`/api/categories/${id}`, {
        method: 'DELETE',
      }),
    }))
  }
}

/**
 * Spendings
 */

export const RECEIVE_CATEGORIES_SPENDINGS = 'RECEIVE_CATEGORIES_SPENDINGS'

interface ReceiveCategoriesSpendings extends t.ReduxAction {
  type: typeof RECEIVE_CATEGORIES_SPENDINGS,
  payload: {
    categoriesSpendings: t.CategoriesSpendingsRes,
  },
}

export function receiveCategoriesSpendings(
  categoriesSpendings: t.CategoriesSpendingsRes
): ReceiveCategoriesSpendings {
  return {
    type: RECEIVE_CATEGORIES_SPENDINGS,
    payload: {
      categoriesSpendings,
    },
  }
}


export function fetchCategoriesSpendings(
  message: string
): t.ReduxThunkAction<Promise<t.CategoriesSpendingsRes>> {
  return (dispatch) => {
    return dispatch(pa.trackRequest({
      message,
      requestName: 'getCategoriesSpendings',
      promise: n.authedJsonFetch<t.CategoriesSpendingsRes>('/api/categories/spendings'),
    }))
      .then((categoriesSpendings) => {
        dispatch(receiveCategoriesSpendings(categoriesSpendings))
        return categoriesSpendings
      })
  }
}
