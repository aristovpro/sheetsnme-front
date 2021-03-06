import * as t from '../types'

import React from 'react'
import {connect} from 'react-redux'

// @ts-ignore
import * as fpx from 'fpx'

import * as e from '../env'
import * as u from '../utils'

import * as a from '../actions'

import * as i18n from '../i18n'
import * as d from '../dialogs'

import * as v from '../views'
import * as s from '../views/svg'

/**
 * CategoryPage
 */

type CategoryPageProps = {}


export class CategoriesPage extends v.ViewComponent<CategoryPageProps> {
  openDialog = () => {
    const {context} = this

    const closeDialog = () => {
      e.dispatch(a.removeDialog<d.FormDialogProps>(dialog))
    }

    const dialog = (
      <d.FormDialog
        title={i18n.xln(context, i18n.NEW_CATEGORY)}
        onClose={closeDialog}
      >
        <CategoryForm onSubmitSuccess={closeDialog} />
      </d.FormDialog>
    )

    e.dispatch(a.addDialog<d.FormDialogProps>(dialog))
  }

  render() {
    const {openDialog} = this

    return (
      <v.ListPageLayout fab={<v.Fab onClick={openDialog} />}>
        <CategoriesList />
      </v.ListPageLayout>
    )
  }
}



/**
 * CategoryForm
 */

type CategoryFormOwnProps = v.FormProps & {
  category?: t.CategoryReq,
}

type CategoryFormStateProps = {
  pending: boolean,
}

type CategoryFormProps = CategoryFormOwnProps & CategoryFormStateProps

type CategoryFormState = {
  formValues: t.CategoryReq,
  errors    : undefined | t.ValidationError[],
}


class _CategoryForm extends v.ViewComponent<CategoryFormProps, CategoryFormState> {
  readonly state = {
    formValues: this.props.category || {title: ''},
    errors: undefined,
  }

  fetchCategories = () => {
    const {context} = this
    return e.dispatch(a.fetchCategories(i18n.xln(context, i18n.FETCHING_CATEGORIES)))
  }

  onSubmit = (event: t.RFormEvent) => {
    u.preventDefault(event)

    const {
      context,
      props: {onSubmitSuccess},
      state: {formValues},
    } = this

    this.setState({errors: undefined})

    const promise = formValues.id
      ? e.dispatch(a.updateCategory(
        formValues.id,
        formValues,
        i18n.xln(context, i18n.UPDATING_CATEGORY)
      ))
      : e.dispatch(a.createCategory(
        formValues,
        i18n.xln(context, i18n.CREATING_CATEGORY)
      ))

    promise
      .catch((errors: t.FetchError) => {
        this.setState({errors})
        throw errors
      })
      .then(() => onSubmitSuccess())
      .then(() => e.dispatch(a.addNotification(formValues.id
        ? i18n.xln(context, i18n.CATEGORY_UPDATED)
        : i18n.xln(context, i18n.CATEGORY_CREATED)
      )))
      .then(this.fetchCategories)
  }

  onDelete = (event: v.FakeButtonEvent) => {
    u.preventDefault(event)

    const {
      context,
      props: {onSubmitSuccess},
      state: {formValues},
    } = this

    this.setState({errors: undefined})

    const closeDialog = () => {
      e.dispatch(a.removeDialog<d.ConfirmDialogProps>(dialog))
    }

    const dialog = (
      <d.ConfirmDialog
        question={i18n.xln(context, i18n.DELETE_CATEGORY)}
        onConfirm={() => {
          closeDialog()
          e.dispatch(a.deleteCategory(
            formValues.id!,
            i18n.xln(context, i18n.DELETING_CATEGORY)
          ))
            .then(() => onSubmitSuccess())
            .then(() => e.dispatch(a.addNotification(i18n.xln(context, i18n.CATEGORY_DELETED))))
            .then(this.fetchCategories)
        }}
        onClose={closeDialog}
      />
    )

    e.dispatch(a.addDialog<d.ConfirmDialogProps>(dialog))
  }

  render() {
    const {
      context, context: {isMobile},
      state: {errors, formValues: {id}},
      props: {pending},
      onSubmit, onDelete,
    } = this

    return (
      <form
        className='col-start-stretch'
        onSubmit={onSubmit}
      >
        <div
          className={`col-start-stretch
                      ${isMobile ? 'padding-v-1 padding-h-1x25' : 'padding-v-1x25'}`}
        >
          <v.FormTextElement
            name='title'
            label={i18n.xln(context, i18n.TITLE)}
            disabled={pending}
            {...u.bindValue(this, ['formValues', 'title'])}
          />
        </div>
        <hr className='hr margin-h-1x25' />
        <div className='row-between-stretch padding-v-1 padding-h-1x25'>
          <div className='flex-1 row-start-stretch'>
            {!id ? null :
            <v.FakeButton
              className='btn-transparent'
              onClick={onDelete}
              disabled={pending}
            >
              {i18n.xln(context, i18n.DELETE)}
            </v.FakeButton>}
          </div>
          <button
            type='submit'
            className={`btn-primary ${isMobile ? '' : 'btn-wide'}`}
            disabled={pending}>
            {i18n.xln(context, i18n.SUBMIT)}
          </button>
          <div className='flex-1' />
        </div>
        {!errors ? null :
        <hr className='hr margin-h-1x25' />}
        <v.FormErrors errors={errors} />
      </form>
    )
  }
}

const CategoryForm = connect<CategoryFormStateProps, {}, CategoryFormOwnProps, t.AppState>(state => ({
  pending: !fpx.isEmpty(state.net.pending),
}))(_CategoryForm)



/**
 * CategoryList
 */

type CategoriesListStateProps = {
  categories: t.CategoryListRes,
  pending   : boolean,
}

type CategoriesListProps = CategoriesListStateProps


class _CategoriesList extends v.ViewComponent<CategoriesListProps> {
  onOpen = (category: t.CategoryRes) => (): void => {
    const {context} = this

    const closeDialog = () => {
      e.dispatch(a.removeDialog<d.FormDialogProps>(dialog))
    }

    const dialog = (
      <d.FormDialog
        title={i18n.xln(context, i18n.EDIT_CATEGORY)}
        onClose={closeDialog}
      >
        <CategoryForm
          category={category}
          onSubmitSuccess={closeDialog}
        />
      </d.FormDialog>
    )

    e.dispatch(a.addDialog<d.FormDialogProps>(dialog))
  }

  onDelete = (category: t.CategoryRes) => (): void => {
    const {context} = this

    const closeDialog = () => {
      e.dispatch(a.removeDialog<d.ConfirmDialogProps>(dialog))
    }

    const dialog = (
      <d.ConfirmDialog
        question={i18n.xln(context, i18n.DELETE_CATEGORY)}
        onConfirm={() => {
          closeDialog()
          e.dispatch(a.deleteCategory(
            category.id,
            i18n.xln(context, i18n.DELETING_CATEGORY)
          ))
            .then(() => e.dispatch(a.addNotification(i18n.xln(context, i18n.CATEGORY_DELETED))))
            .then(() => e.dispatch(a.fetchCategories(i18n.xln(context, i18n.FETCHING_CATEGORIES))))
        }}
        onClose={closeDialog}
      />
    )

    e.dispatch(a.addDialog<d.FormDialogProps>(dialog))
  }

  render() {
    const {
      context: {isMobile},
      props: {categories, pending},
      onOpen, onDelete,
    } = this

    return (
      <div className='col-start-stretch gaps-v-0x25'>
        <div
          className={`row-end-center
                      ${isMobile
                          ? 'padding-t-1x75 padding-r-1'
                          : 'padding-t-1x25 padding-r-3x5'}`}
        >
        </div>
        <v.EntityList
          entityList={categories}
          pending={pending}
        >
          {categories.map(category => (
            <v.Entity
              key={category.id}
              icon={<s.Tag className='font-large fg-primary' />}
              onOpen={onOpen(category)}
              onDelete={onDelete(category)}>
              {category.title}
            </v.Entity>
          ))}
        </v.EntityList>
      </div>
    )
  }
}

const CategoriesList = connect<CategoriesListStateProps, {}, {}, t.AppState>(state => ({
  categories: state.net.categories.categoryList,
  pending: !fpx.isEmpty(state.net.pending),
}))(_CategoriesList)
