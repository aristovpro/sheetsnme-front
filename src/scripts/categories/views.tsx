import * as t from '../types'

import React from 'react'
import {connect} from 'react-redux'

// @ts-ignore
import * as fpx from 'fpx'

import * as u from '../utils'

import * as a from '../actions'

import * as g from '../geometry'
import * as i18n from '../i18n'

import * as m from '../views/misc'
import * as s from '../views/svg'
import * as f from '../views/forms'

import * as p from '../views/pages'

class _CategoriesPage extends m.ViewComponent {
  render() {
    const {
      context,
      props: {dispatch},
    } = this

    const action = (
      <p.Fab
        onClick={() => dispatch(a.addDialog(p.FormDialog, {
          form: CategoryForm,
          title: i18n.xln(context, i18n.NEW_CATEGORY),
        }))}
      />
    )

    return (
      <p.ListPage action={action}>
        <CategoriesList />
      </p.ListPage>
    )
  }
}

export const CategoriesPage = connect()(_CategoriesPage)


type CategoryFormState = {
  formValues: t.CategoryRes,
  errors: undefined | t.ValidationError[],
}

type CategoryFormOwnProps = {
  category: t.CategoryRes,
  onSubmitSuccess: () => void,
}

type CategoryFormStateProps = {
  pending: boolean,
}

type CategoryFormProps = CategoryFormOwnProps & CategoryFormStateProps

class _CategoryForm extends m.ViewComponent<CategoryFormProps, CategoryFormState> {
  state: Readonly<CategoryFormState> = {
    formValues: this.props.category || {},
    errors: undefined,
  }

  onSubmit = (event: t.RFormEvent): void => {
    u.preventDefault(event)

    this.setState({errors: undefined})

    const {
      context,
      props: {dispatch, onSubmitSuccess},
      state: {formValues},
    } = this

    const promise = formValues.id
      ? dispatch(a.updateCategory(
        formValues.id,
        formValues,
        i18n.xln(context, i18n.UPDATING_CATEGORY)
      ))
      : dispatch(a.createCategory(
        formValues,
        i18n.xln(context, i18n.CREATING_CATEGORY)
      ))

    promise
      .catch(errors => {
        this.setState({errors})
        throw errors
      })
      .then(() => onSubmitSuccess())
      .then(() => dispatch(a.addNotification(formValues.id
        ? i18n.xln(context, i18n.CATEGORY_UPDATED)
        : i18n.xln(context, i18n.CATEGORY_CREATED)
      )))
      .then(() => dispatch(a.fetchCategories(i18n.xln(context, i18n.FETCHING_CATEGORIES))))
  }

  onDelete = (event: t.RFormEvent) => {
    u.preventDefault(event)

    this.setState({errors: undefined})

    const {
      context,
      props: {dispatch, onSubmitSuccess},
      state: {formValues},
    } = this

    dispatch(a.addDialog(p.ConfirmDialog, {
      question: i18n.xln(context, i18n.DELETE_CATEGORY),
      onConfirm: () => {
        dispatch(a.deleteCategory(
          formValues.id,
          i18n.xln(context, i18n.DELETING_CATEGORY)
        ))
          .then(() => {onSubmitSuccess()})
          .then(() => dispatch(a.addNotification(i18n.xln(context, i18n.CATEGORY_DELETED))))
          .then(() => dispatch(a.fetchCategories(i18n.xln(context, i18n.FETCHING_CATEGORIES))))
      },
    }))
  }

  render() {
    const {
      context,
      state: {errors, formValues: {id}},
      props: {pending},
      onSubmit, onDelete,
    } = this

    const isMobile = g.isMobile(context)
    const disabled = pending

    return (
      <form className='col-start-stretch' onSubmit={onSubmit}>
        <div
          className={`col-start-stretch
                      ${isMobile ? 'padding-v-1 padding-h-1x25' : 'padding-v-1x25'}`}
        >
          <f.FormTextElement
            name='title'
            label={i18n.xln(context, i18n.TITLE)}
            disabled={disabled}
            {...u.bindValue(this, ['formValues', 'title'])}
          />
        </div>
        <hr className='hr margin-h-1x25' />
        <div className='row-between-stretch padding-v-1 padding-h-1x25'>
          <div className='flex-1 row-start-stretch'>
            {!id ? null :
            <m.FakeButton
              className='btn-transparent'
              onClick={onDelete}
              disabled={disabled}
            >
              {i18n.xln(context, i18n.DELETE)}
            </m.FakeButton>}
          </div>
          <button
            type='submit'
            className={`btn-primary ${isMobile ? '' : 'btn-wide'}`}
            disabled={disabled}>
            {i18n.xln(context, i18n.SUBMIT)}
          </button>
          <div className='flex-1' />
        </div>
        {!errors ? null :
        <hr className='hr margin-h-1x25' />}
        <f.FormErrors errors={errors} />
      </form>
    )
  }
}

export const CategoryForm = connect<CategoryFormStateProps, {}, CategoryFormOwnProps, t.AppState>(state => ({
  pending: !fpx.isEmpty(state.net.pending),
}))(_CategoryForm)


type CategoriesListStateProps = {
  categories: t.CategoryListRes,
  pending: boolean,
}

type CategoriesListProps = CategoriesListStateProps

class _CategoriesList extends m.ViewComponent<CategoriesListProps> {
  onOpen = (category: t.CategoryRes) => () => {
    const {context, props: {dispatch}} = this

    dispatch(a.addDialog(p.FormDialog, {
      form: CategoryForm,
      formProps: {category},
      title: i18n.xln(context, i18n.EDIT_CATEGORY),
    }))
  }

  onDelete = (category: t.CategoryRes) => () => {
    const {context, props: {dispatch}} = this

    dispatch(a.addDialog(p.ConfirmDialog, {
      question: i18n.xln(context, i18n.DELETE_CATEGORY),
      onConfirm: () => {
        dispatch(a.deleteCategory(category.id, i18n.xln(context, i18n.DELETING_CATEGORY)))
          .then(() => dispatch(a.addNotification(i18n.xln(context, i18n.CATEGORY_DELETED))))
          .then(() => dispatch(a.fetchCategories(i18n.xln(context, i18n.FETCHING_CATEGORIES))))
      },
    }))
  }

  render() {
    const {
      props: {categories, pending},
      onOpen, onDelete,
    } = this

    return pending || !fpx.size(categories) ? (
      <div className='col-start-stretch'>
        {new Array(fpx.size(categories) || 3).map((__, index) => (
          <p.EntityPlaceholder key={`placeholder-${index}`} />
        ))}
      </div>
    ) : (
      <div className='col-start-stretch'>
        {categories.map(category => (
          <p.EntityItem
            key={category.id}
            icon={<s.Tag className='font-large fg-primary' />}
            onOpen={onOpen(category)}
            onDelete={onDelete(category)}>
            {category.title}
          </p.EntityItem>
        ))}
      </div>
    )
  }
}

const CategoriesList = connect<CategoriesListStateProps, {}, {}, t.AppState>(state => ({
  categories: state.net.categories.categoryList,
  pending: !fpx.isEmpty(state.net.pending),
}))(_CategoriesList)