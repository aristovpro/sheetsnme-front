import React, {Fragment} from 'react'
import {connect} from 'react-redux'
import {NavLink, Link, withRouter} from 'react-router-dom'
import ReactPaginate from 'react-paginate'

import * as f from 'fpx'

import * as a from '../actions'
import * as u from '../utils'

import * as m from './misc'
import * as s from './svg'

import * as t from '../translations'

/**
 * Layouts
 */

class PageLayout extends u.ViewComponent {
  render() {
    const {
      props: {className: cls, style, children},
    } = this

    return (
      <div className='relative col-start-stretch stretch-to-viewport-v'>
        <Navbar />
        <div className='row-start-stretch gaps-h-1'>
          <Drawer />
          <div
            className={`flex-1 ${cls || ''}`}
            style={style}
            children={children} />
        </div>
        <div className='fix-b-l z-index-tooltip width-100p row-start-center margin-0x5'>
          <Notifications />
        </div>
        <m.GlobalDialog />
      </div>
    )
  }
}

class _MobilePageLayout extends u.ViewComponent {
  render() {
    const {
      props: {className: cls, style, children, action, dialogs},
    } = this

    return (
      <div className='relative col-start-stretch stretch-to-viewport-v padding-b-5'>
        <Navbar />
        <div
          className={`flex-1 ${cls || ''}`}
          style={style}
          children={children} />
        <div className='fix-b-l z-index-tooltip width-100p col-start-stretch gaps-v-0x5 padding-0x5'>
          <Notifications />
          {!action || f.size(dialogs) ? null :
          <div className='row-end-center padding-0x5'>
            {action}
          </div>}
        </div>
        <m.GlobalDialog />
      </div>
    )
  }
}

const MobilePageLayout = connect(state => ({
  dialogs: state.dom.dialogs,
}))(_MobilePageLayout)



/**
 * Navigation
 */

class Logo extends u.ViewComponent {
  render() {
    return (
      <s.Logo className='fg-surface' style={{width: '2rem', height: '2rem'}} />
    )
  }
}

class _Navbar extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    const {context} = this

    this.open = () => {
      dispatch(a.addDialog(MobileMenu))
    }

    this.nextLang = () => {
      dispatch(a.nextLang(u.nextLang(context)))
    }
  }

  render() {
    const {
      context,
      open, nextLang,
    } = this

    if (u.isMobile(context)) {
      return (
        <header className='row-between-stretch bg-primary navbar-height shadow-dept-1'>
          <div className='row-start-center gaps-h-0x75 padding-h-1'>
            <m.FakeButton
              className='row-center-center padding-0x5 circle decorate-dark-menu-item'
              onClick={open}>
              <s.Menu
                style={{fontSize: '1.5rem'}} />
            </m.FakeButton>
          </div>
          <div className='row-start-stretch relative z-index-1'>
            <m.FakeButton
              onClick={nextLang}
              className='relative row-start-center gaps-h-0x75 padding-h-1 decorate-dark-menu-item'>
              {u.xln(context, t.LANG)}
            </m.FakeButton>
            <UserMenu />
          </div>
        </header>
      )
    }

    return (
      <header className='row-between-stretch bg-primary navbar-height shadow-dept-1'>
        <Link to='/' className='row-center-center gaps-h-0x75 padding-h-1 decorate-dark-menu-item'>
          <Logo />
        </Link>
        <div className='row-start-stretch relative z-index-1'>
          <m.FakeButton
            onClick={nextLang}
            className='relative row-start-center gaps-h-0x75 padding-h-1 decorate-dark-menu-item'>
            {u.xln(context, t.LANG)}
          </m.FakeButton>
          <UserMenu />
        </div>
      </header>
    )
  }
}

const Navbar = connect()(_Navbar)

class _UserMenu extends u.ViewComponent {
  constructor() {
    super(...arguments)

    this.state = {expanded: false}

    this.close = () => {
      this.setState({expanded: false})
    }

    this.toggle = () => {
      this.setState({expanded: !this.state.expanded})
    }
  }

  render() {
    const {
      context,
      props: {user},
      state: {expanded},
      close, toggle,
    } = this

    const {firstName, lastName, pictureUrl, email} = user

    return f.isEmpty(user) ? null : (
      <div className='relative row-start-stretch'>
        <m.FakeButton
          onClick={toggle}
          className='relative row-start-center gaps-h-0x75 padding-h-1 decorate-dark-menu-item z-index-2'
          aria-expanded={expanded}>
          <m.CircleUserPic
            url={pictureUrl}
            size='2' />
        </m.FakeButton>
        {!expanded ? null :
        <m.Closer root={this} close={close}>
          <div
            className='dropdown-position z-index-tooltip'
            onClick={close}>
            <div className='dropdown dropdown-padding col-start-stretch' style={{minWidth: '11rem'}}>
              <div className='row-start-center gaps-h-0x75 padding-v-0x5 padding-h-1'>
                <m.CircleUserPic
                  url={pictureUrl}
                  size='4' />
                <div className='col-start-stretch gaps-v-0x5'>
                  <div className='col-start-stretch'>
                    <span className='weight-medium wspace-nowrap'>
                      {`${firstName || ''} ${lastName || ''}`}
                    </span>
                    {!email ? null :
                    <span className='font-midsmall'>
                      {email}
                    </span>}
                  </div>
                  <div className='row-start-center'>
                    <a href='/auth/logout' className='btn-secondary'>
                      {u.xln(context, t.LOGOUT)}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </m.Closer>}
      </div>
    )
  }
}

const UserMenu = connect(state => ({
  user: state.net.user,
}))(_UserMenu)

class _MobileMenu extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    this.close = () => {
      dispatch(a.removeDialog())
    }
  }

  render() {
    const {close} = this

    return
      <m.Dialog onEscape={close}>
        <m.DialogScrollable className='row-start-stretch bg-overlay fade-in-fast' onClick={close}>
          <div className='relative col-start-stretch gaps-v-0x5 bg-surface slide-in-left-fast' onClick={close}>
            <div className='row-start-center padding-h-1 bg-primary navbar-height shadow-dept-1'>
              <Logo />
            </div>
            <Drawer />
          </div>
        </m.DialogScrollable>
      </m.Dialog>
    )
  }
}

const MobileMenu = connect()(_MobileMenu)

class Drawer extends u.ViewComponent {
  render() {
    const {context} = this

    return (
      <aside className='col-start-stretch gaps-v-1 padding-v-1' style={{width: '16rem'}}>
        <div className='col-start-stretch padding-h-0x5'>
          <NavLink
            to='/'
            exact
            className='drawer-link decorate-drawer-link'>
            <s.BarChart className='font-large theme-drawer-icon' />
            <span>{u.xln(context, t.TRANSACTIONS)}</span>
          </NavLink>
        </div>
        <hr className='hr' />
        <div className='col-start-stretch padding-h-0x5'>
          <NavLink
            to='/categories'
            exact
            className='drawer-link decorate-drawer-link'>
            <s.Tag className='font-large theme-drawer-icon' />
            <span>{u.xln(context, t.CATEGORIES)}</span>
          </NavLink>
          <NavLink
            to='/accounts'
            exact
            className='drawer-link decorate-drawer-link'>
            <s.CreditCard className='font-large theme-drawer-icon' />
            <span>{u.xln(context, t.ACCOUNTS)}</span>
          </NavLink>
          <NavLink
            to='/payees'
            exact
            className='drawer-link decorate-drawer-link'>
            <s.Users className='font-large theme-drawer-icon' />
            <span>{u.xln(context, t.PAYEES)}</span>
          </NavLink>
        </div>
      </aside>
    )
  }
}



/**
 * Notifications
 */

class _Notifications extends u.ViewComponent {
  componentWillUnmount() {
    if (this.timeoutId) clearTimeout(this.timeoutId)
  }

  render() {
    const {props: {notifications, dispatch}} = this

    const notification = notifications[0]
    if (!notification) return null

    if (notification.timeout) {
      this.timeoutId = setTimeout(() => {
        dispatch(a.removeNotification(notification.time))
      }, notification.timeout)
    }

    return (
      <Snackbar>
        <div>
          {notification.messages
            ? f.map(notification.messages, ({text}, index) => (
              <p key={`notification-${index}`}>{text}</p>
            ))
            : notification.text}
        </div>
      </Snackbar>
    )
  }
}

const Notifications = connect(state => ({
  notifications: state.dom.notifications,
}))(_Notifications)

class Snackbar extends u.ViewComponent {
  render() {
    const {props: {children, action}} = this

    return action ? (
      <div className='row-start-center padding-l-1 padding-v-0x25 snackbar'>
        <div className='col-start-stretch'>{children}</div>
        <div className='row-start-center padding-h-0x5'>
          {action}
        </div>
      </div>
    ) : (
      <div className='row-start-center padding-h-1 padding-v-0x75 snackbar'>
        {children}
      </div>
    )
  }
}



/**
 * Entities
 */

class EntityPlaceholder extends u.ViewComponent {
  render() {
    const {context} = this

    const isMobile = u.isMobile(context)

    return (
      <div className='row-start-stretch gaps-h-1 padding-h-1'>
        <div className='relative width-2x5 square'>
          <div className='row-center-center abs-center'>
            <div className='width-1x5 square circle decorate-placeholder' />
          </div>
        </div>
        <div className='flex-1 col-start-stretch'>
          <div className='flex-1 row-start-center padding-v-1'>
            <Placeholder style={{width: '8em'}} />
          </div>
        </div>
        {isMobile ? null :
        <div className='row-center-center padding-h-0x25'>
          <div className='row-center-center' style={{minHeight: '2.5rem'}}>
            <s.Trash2 className='font-large fg-transparent' />
          </div>
        </div>}
      </div>
    )
  }
}

class EntityItem extends u.ViewComponent {
  constructor({onOpen}) {
    super(...arguments)
    this.actionsRef = React.createRef()

    this.onClick = event => {
      if (!onOpen) return
      f.validate(onOpen, f.isFunction)

      const actionsNode = u.findDomNode(this.actionsRef.current)
      if (u.isAncestorOf(actionsNode, event.target)) return

      onOpen()
    }
  }

  render() {
    const {
      context,
      props: {children, icon, onDelete},
      onClick, actionsRef,
    } = this

    const isMobile = u.isMobile(context)

    return (
      <m.FakeButton
        type='div'
        onClick={onClick}
        className='row-start-stretch gaps-h-1 padding-h-1 text-left theme-drawer-link-busy rounded trigger'>
        <div className='relative width-2x5 square'>
          <div className='row-center-center abs-center'>
            {icon}
          </div>
        </div>
        <div className='flex-1 col-start-stretch'>
          <div className='flex-1 row-between-center padding-v-1'>
            {children}
          </div>
        </div>
        {isMobile ? null :
        <div className='row-center-center padding-h-0x25' ref={actionsRef}>
          <div className='row-center-center' style={{minHeight: '2.5rem'}}>
            <m.FakeButton
              className='row-center-center show-on-trigger-hover decorate-icon-button'
              onClick={onDelete}>
              <s.Trash2 className='font-large' />
            </m.FakeButton>
          </div>
        </div>}
      </m.FakeButton>
    )
  }
}

class Placeholder extends u.ViewComponent {
  render() {
    const {props: {style, className: cls}} = this

    return (
      <span className={`inline-block ${cls || ''}`}>
        <span
          className='inline-block valign-middle decorate-placeholder rounded-50p'
          style={{width: '3em', height: '1em', ...style}} />
      </span>
    )
  }
}



/**
 * Categories
 */

class _CategoriesPage extends u.ViewComponent {
  render() {
    const {
      context,
      props: {dispatch},
    } = this

    const action = (
      <Fab
        onClick={() => dispatch(a.addDialog(FormDialog, {
          form: CategoryForm,
          title: u.xln(context, t.NEW_CATEGORY),
        }))} />
    )

    return (
      <ListPage action={action}>
        <CategoriesList />
      </ListPage>
    )
  }
}

export const CategoriesPage = connect()(_CategoriesPage)

class _CategoryForm extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    this.state = {formValues: this.props.category || {}}

    this.onSubmit = event => {
      u.preventDefault(event)

      this.setState({errors: undefined})

      const {context, props, state} = this
      const {formValues} = state

      const promise = formValues.id
        ? dispatch(a.updateCategory(formValues.id, formValues, u.xln(context, t.UPDATING_CATEGORY)))
        : dispatch(a.createCategory(formValues, u.xln(context, t.CREATING_CATEGORY)))

      promise
        .catch(errors => {
          this.setState({errors})
          throw errors
        })
        .then(() => {props.onSubmitSuccess()})
        .then(() => dispatch(a.addNotification(formValues.id
          ? u.xln(context, t.CATEGORY_UPDATED)
          : u.xln(context, t.CATEGORY_CREATED)
        )))
        .then(() => dispatch(a.fetchCategories(u.xln(context, t.FETCHING_CATEGORIES))))
    }

    this.onDelete = event => {
      u.preventDefault(event)

      this.setState({errors: undefined})

      const {context, props, state} = this
      const {formValues} = state

      dispatch(a.addDialog(ConfirmDialog, {
        question: u.xln(context, t.DELETE_CATEGORY),
        onConfirm: () => {
          dispatch(a.deleteCategory(formValues.id, u.xln(context, t.DELETING_CATEGORY)))
            .then(() => {props.onSubmitSuccess()})
            .then(() => dispatch(a.addNotification(u.xln(context, t.CATEGORY_DELETED))))
            .then(() => dispatch(a.fetchCategories(u.xln(context, t.FETCHING_CATEGORIES))))
        },
      }))
    }
  }

  render() {
    const {
      context,
      state: {errors, formValues: {id}},
      props: {pending},
      onSubmit, onDelete,
    } = this

    const isMobile = u.isMobile(context)
    const disabled = pending

    return (
      <form className='col-start-stretch' onSubmit={onSubmit}>
        <div className={`col-start-stretch ${isMobile ? 'padding-v-1 padding-h-1x25' : 'padding-v-1x25'}`}>
          <FormTextElement
            name='title'
            label={u.xln(context, t.TITLE)}
            disabled={disabled}
            {...u.bindValue(this, ['formValues', 'title'])} />
        </div>
        <hr className='hr margin-h-1x25' />
        <div className='row-between-stretch padding-v-1 padding-h-1x25'>
          <div className='flex-1 row-start-stretch'>
            {!id ? null :
            <m.FakeButton
              className='btn-transparent'
              onClick={onDelete}
              disabled={disabled}>
              {u.xln(context, t.DELETE)}
            </m.FakeButton>}
          </div>
          <button
            type='submit'
            className={`btn-primary ${isMobile ? '' : 'btn-wide'}`}
            disabled={disabled}>
            {u.xln(context, t.SUBMIT)}
          </button>
          <div className='flex-1' />
        </div>
        {!errors ? null :
        <hr className='hr margin-h-1x25' />}
        <FormErrors errors={errors} />
      </form>
    )
  }
}

const CategoryForm = connect(state => ({
  pending: !f.isEmpty(state.net.pending),
}))(_CategoryForm)

class _CategoriesList extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    const {context} = this

    this.onOpen = category => () => {
      dispatch(a.addDialog(FormDialog, {
        form: CategoryForm,
        formProps: {category},
        title: u.xln(context, t.EDIT_CATEGORY),
      }))
    }

    this.onDelete = category => () => {
      dispatch(a.addDialog(ConfirmDialog, {
        question: u.xln(context, t.DELETE_CATEGORY),
        onConfirm: () => {
          dispatch(a.deleteCategory(category.id, u.xln(context, t.DELETING_CATEGORY)))
            .then(() => dispatch(a.addNotification(u.xln(context, t.CATEGORY_DELETED))))
            .then(() => dispatch(a.fetchCategories(u.xln(context, t.FETCHING_CATEGORIES))))
        },
      }))
    }
  }

  render() {
    const {
      props: {categories, pending},
      onOpen, onDelete,
    } = this

    return pending || !f.size(categories) ? (
      <div className='col-start-stretch'>
        {f.map(new Array(f.size(categories) || 3), (__, index) => (
          <EntityPlaceholder key={`placeholder-${index}`} />
        ))}
      </div>
    ) : (
      <div className='col-start-stretch'>
        {f.map(categories, category => (
          <EntityItem
            key={category.id}
            icon={<s.Tag className='font-large fg-primary' />}
            onOpen={onOpen(category)}
            onDelete={onDelete(category)}>
            {category.title}
          </EntityItem>
        ))}
      </div>
    )
  }
}

const CategoriesList = connect(state => ({
  categories: state.net.categories,
  pending: !f.isEmpty(state.net.pending),
}))(_CategoriesList)



/**
 * Accounts
 */

class _AccountsPage extends u.ViewComponent {
  render() {
    const {
      context,
      props: {dispatch},
    } = this

    const action = (
      <Fab
        onClick={() => dispatch(a.addDialog(FormDialog, {
          form: AccountForm,
          title: u.xln(context, t.NEW_ACCOUNT),
        }))} />
    )

    return (
      <ListPage action={action}>
        <AccountsList />
      </ListPage>
    )
  }
}

export const AccountsPage = connect()(_AccountsPage)

class _AccountForm extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    this.state = {formValues: this.props.account || {}}

    this.onSubmit = event => {
      u.preventDefault(event)

      this.setState({errors: undefined})

      const {context, props, state} = this
      const {formValues} = state

      const promise = formValues.id
        ? dispatch(a.updateAccount(formValues.id, formValues, u.xln(context, t.UPDATING_ACCOUNT)))
        : dispatch(a.createAccount(formValues, u.xln(context, t.CREATING_ACCOUNT)))

      promise
        .catch(errors => {
          this.setState({errors})
          throw errors
        })
        .then(() => {props.onSubmitSuccess()})
        .then(() => dispatch(a.addNotification(formValues.id
          ? u.xln(context, t.ACCOUNT_UPDATED)
          : u.xln(context, t.ACCOUNT_CREATED)
        )))
        .then(() => dispatch(a.fetchAccounts(u.xln(context, t.FETCHING_ACCOUNTS))))
    }

    this.onDelete = event => {
      u.preventDefault(event)

      this.setState({errors: undefined})

      const {context, props, state} = this
      const {formValues} = state

      dispatch(a.addDialog(ConfirmDialog, {
        question: u.xln(context, t.DELETE_ACCOUNT),
        onConfirm: () => {
          dispatch(a.deleteAccount(formValues.id, u.xln(context, t.DELETING_ACCOUNT)))
            .then(() => {props.onSubmitSuccess()})
            .then(() => dispatch(a.addNotification(u.xln(context, t.ACCOUNT_DELETED))))
            .then(() => dispatch(a.fetchAccounts(u.xln(context, t.FETCHING_ACCOUNTS))))
        },
      }))
    }
  }

  render() {
    const {
      context,
      state: {errors, formValues: {id}},
      props: {pending},
      onSubmit, onDelete,
    } = this

    const isMobile = u.isMobile(context)
    const disabled = pending

    return (
      <form className='col-start-stretch' onSubmit={onSubmit}>
        <div className={`col-start-stretch ${isMobile ? 'padding-v-1 padding-h-1x25' : 'padding-v-1x25'}`}>
          <FormTextElement
            name='title'
            label='Name'
            disabled={disabled}
            {...u.bindValue(this, ['formValues', 'title'])} />
        </div>
        <hr className='hr margin-h-1x25' />
        <div className='row-between-stretch padding-v-1 padding-h-1x25'>
          <div className='flex-1 row-start-stretch'>
            {!id ? null :
            <m.FakeButton
              className='btn-transparent'
              onClick={onDelete}
              disabled={disabled}>
              {u.xln(context, t.DELETE)}
            </m.FakeButton>}
          </div>
          <button
            type='submit'
            className={`btn-primary ${isMobile ? '' : 'btn-wide'}`}
            disabled={disabled}>
            {u.xln(context, t.SUBMIT)}
          </button>
          <div className='flex-1' />
        </div>
        {!errors ? null :
        <hr className='hr margin-h-1x25' />}
        <FormErrors errors={errors} />
      </form>
    )
  }
}

const AccountForm = connect(state => ({
  pending: !f.isEmpty(state.net.pending),
}))(_AccountForm)

class _AccountsList extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    const {context} = this

    this.onOpen = account => () => {
      dispatch(a.addDialog(FormDialog, {
        form: AccountForm,
        formProps: {account},
        title: u.xln(context, t.EDIT_ACCOUNT),
      }))
    }

    this.onDelete = account => () => {
      dispatch(a.addDialog(ConfirmDialog, {
        question: u.xln(context, t.DELETE_ACCOUNT),
        onConfirm: () => {
          dispatch(a.deleteAccount(account.id, u.xln(context, t.DELETING_ACCOUNT)))
            .then(() => dispatch(a.addNotification({text: u.xln(context, t.ACCOUNT_DELETED)})))
            .then(() => dispatch(a.fetchAccounts(u.xln(context, t.FETCHING_ACCOUNTS))))
        },
      }))
    }
  }

  render() {
    const {
      context,
      props: {accounts, pending},
      onOpen, onDelete,
    } = this

    const isMobile = u.isMobile(context)
    return (
      <div className='col-start-stretch gaps-v-2'>
        <div className='col-start-stretch gaps-v-0x25'>
          <div className={`row-end-center ${isMobile ? 'padding-t-0x5 padding-r-1' : 'padding-r-3x5'}`}>
            <span className='fg-on-surface-pale'>{u.xln(context, t.BALANCE)}</span>
          </div>
          {pending || !f.size(accounts) ? (
            <div className='col-start-stretch'>
              {f.map(new Array(f.size(accounts) || 3), (__, index) => (
                <EntityPlaceholder key={`placeholder-${index}`} />
              ))}
            </div>
          ) : (
            <div className='col-start-stretch'>
              {f.map(accounts, account => (
                <EntityItem
                  key={account.id}
                  icon={<s.CreditCard className='font-large fg-primary' />}
                  onOpen={onOpen(account)}
                  onDelete={onDelete(account)}>
                  <div className='flex-1 row-between-center gaps-h-1'>
                    <span>{account.title}</span>
                    { account.balance > 0
                    ? <span className='fg-success'>+{account.balance}</span>
                    : account.balance < 0
                    ? <span className='fg-error'>{account.balance}</span>
                    : <span className='fg-on-surface-pale'>{account.balance}</span>}
                  </div>
                </EntityItem>
              ))}
            </div>)}
        </div>
      </div>
    )
  }
}

const AccountsList = connect(state => ({
  accounts: state.net.accounts,
  pending: !f.isEmpty(state.net.pending),
}))(_AccountsList)



/**
 * Payees
 */

class _PayeesPage extends u.ViewComponent {
  render() {
    const {
      context,
      props: {dispatch},
    } = this

    const action = (
      <Fab
        onClick={() => dispatch(a.addDialog(FormDialog, {
          form: PayeeForm,
          title: u.xln(context, t.NEW_PAYEE),
        }))} />
    )

    return (
      <ListPage action={action}>
        <PayeesList />
      </ListPage>
    )
  }
}

export const PayeesPage = connect()(_PayeesPage)

class _PayeeForm extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    this.state = {formValues: this.props.payee || {}}

    this.onSubmit = event => {
      u.preventDefault(event)

      this.setState({errors: undefined})

      const {context, props, state} = this
      const {formValues} = state

      const promise = formValues.id
        ? dispatch(a.updatePayee(formValues.id, formValues, u.xln(context, t.UPDATING_PAYEE)))
        : dispatch(a.createPayee(formValues, u.xln(context, t.CREATING_PAYEE)))

      promise
        .catch(errors => {
          this.setState({errors})
          throw errors
        })
        .then(() => {props.onSubmitSuccess()})
        .then(() => dispatch(a.addNotification(formValues.id
          ? u.xln(context, t.PAYEE_UPDATED)
          : u.xln(context, t.PAYEE_CREATED)
        )))
        .then(() => dispatch(a.fetchPayees(u.xln(context, t.FETCHING_PAYEES))))
    }

    this.onDelete = event => {
      u.preventDefault(event)

      this.setState({errors: undefined})

      const {context, props, state} = this
      const {formValues} = state

      dispatch(a.addDialog(ConfirmDialog, {
        question: u.xln(context, t.DELETE_PAYEE),
        onConfirm: () => {
          dispatch(a.deletePayee(formValues.id, u.xln(context, t.DELETING_PAYEE)))
            .then(() => {props.onSubmitSuccess()})
            .then(() => dispatch(a.addNotification(u.xln(context, t.PAYEE_DELETED))))
            .then(() => dispatch(a.fetchPayees(u.xln(context, t.FETCHING_PAYEES))))
        },
      }))
    }
  }

  render() {
    const {
      context,
      state: {errors, formValues: {id}},
      props: {pending},
      onSubmit, onDelete,
    } = this

    const isMobile = u.isMobile(context)
    const disabled = pending

    return (
      <form className='col-start-stretch' onSubmit={onSubmit}>
        <div className={`col-start-stretch ${isMobile ? 'padding-v-1 padding-h-1x25' : 'padding-v-1x25'}`}>
          <FormTextElement
            name='title'
            label='Name'
            disabled={disabled}
            {...u.bindValue(this, ['formValues', 'title'])} />
        </div>
        <hr className='hr margin-h-1x25' />
        <div className='row-between-stretch padding-v-1 padding-h-1x25'>
          <div className='flex-1 row-start-stretch'>
            {!id ? null :
            <m.FakeButton
              className='btn-transparent'
              onClick={onDelete}
              disabled={disabled}>
              {u.xln(context, t.DELETE)}
            </m.FakeButton>}
          </div>
          <button
            type='submit'
            className={`btn-primary ${isMobile ? '' : 'btn-wide'}`}
            disabled={disabled}>
            {u.xln(context, t.SUBMIT)}
          </button>
          <div className='flex-1' />
        </div>
        {!errors ? null :
        <hr className='hr margin-h-1x25' />}
        <FormErrors errors={errors} />
      </form>
    )
  }
}

const PayeeForm = connect(state => ({
  pending: !f.isEmpty(state.net.pending),
}))(_PayeeForm)

class _PayeesList extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    const {context} = this

    this.onOpen = payee => () => {
      dispatch(a.addDialog(FormDialog, {
        form: PayeeForm,
        formProps: {payee},
        title: u.xln(context, t.EDIT_PAYEE),
      }))
    }

    this.onDelete = payee => () => {
      dispatch(a.addDialog(ConfirmDialog, {
        question: u.xln(context, t.DELETE_PAYEE),
        onConfirm: () => {
          dispatch(a.deletePayee(payee.id, u.xln(context, t.DELETING_PAYEE)))
            .then(() => dispatch(a.addNotification(u.xln(context, t.PAYEE_DELETED))))
            .then(() => dispatch(a.fetchPayees(u.xln(context, t.FETCHING_PAYEES))))
        },
      }))
    }
  }

  render() {
    const {
      context,
      props: {payees, pending},
      onOpen, onDelete,
    } = this

    const isMobile = u.isMobile(context)
    return (
      <div className='col-start-stretch gaps-v-2'>
        <div className='col-start-stretch gaps-v-0x25'>
          <div className={`row-end-center ${isMobile ? 'padding-t-0x5 padding-r-1' : 'padding-r-3x5'}`}>
            <span className='fg-on-surface-pale'>{u.xln(context, t.DEBT)}</span>
          </div>
          {pending || !f.size(payees) ? (
            <div className='col-start-stretch'>
              {f.map(new Array(f.size(payees) || 3), (__, index) => (
                <EntityPlaceholder key={`placeholder-${index}`} />
              ))}
            </div>
          ) : (
            <div className='col-start-stretch'>
              {f.map(payees, payee => (
                <EntityItem
                  key={payee.id}
                  icon={<s.Users className='font-large fg-primary' />}
                  onOpen={onOpen(payee)}
                  onDelete={onDelete(payee)}>
                  <div className='flex-1 row-between-center gaps-h-1'>
                    <span>{payee.title}</span>
                    { payee.debt > 0
                    ? <span className='fg-success'>+{payee.debt}</span>
                    : payee.debt < 0
                    ? <span className='fg-error'>{payee.debt}</span>
                    : <span className='fg-on-surface-pale'>{payee.debt}</span>}
                  </div>
                </EntityItem>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
}

const PayeesList = connect(state => {
  const payees  = f.sortBy(state.net.payees, payee => !payee.debt ? Infinity : payee.debt)
  const pending = !f.isEmpty(state.net.pending)

  return {
    payees,
    pending,
  }
})(_PayeesList)



/**
 * Transactions
 */

class _TransactionsPage extends u.ViewComponent {
  render() {
    const {
      context,
      props: {dispatch},
    } = this

    const action = (
      <Fab
        onClick={() => dispatch(a.addDialog(FormDialog, {
          form: TransactionForm,
          title: u.xln(context, t.NEW_TRANSACTION),
        }))} />
    )

    return (
      <ListPage action={action}>
        <TransactionsList />
      </ListPage>
    )
  }
}

export const TransactionsPage = connect()(_TransactionsPage)

const OUTCOME  = 'OUTCOME'
const INCOME   = 'INCOME'
const TRANSFER = 'TRANSFER'
const LOAN     = 'LOAN'
const BORROW   = 'BORROW'

class _TransactionForm extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    this.state = {formValues: this.props.transaction || {type: OUTCOME, date: u.formatDate(new Date())}}

    this.onSubmit = event => {
      u.preventDefault(event)

      this.setState({errors: undefined})

      const {context, props, state} = this
      const {location, onSubmitSuccess} = props
      const {formValues} = state
      const data = {...formValues, date: u.formatDate(formValues.date)}

      const promise = formValues.id
        ? dispatch(a.updateTransaction(formValues.id, data, u.xln(context, t.UPDATING_TRANSACTION)))
        : dispatch(a.createTransaction(data, u.xln(context, t.CREATING_TRANSACTION)))

      promise
        .catch(errors => {
          this.setState({errors})
          throw errors
        })
        .then(() => {onSubmitSuccess()})
        .then(() => dispatch(a.addNotification(formValues.id
            ? u.xln(context, t.TRANSACTION_UPDATED)
            : u.xln(context, t.TRANSACTION_CREATED)
        )))
        .then(() => dispatch(a.fetchTransactions(location, u.xln(context, t.FETCHING_TRANSACTIONS))))
    }

    this.onDelete = event => {
      u.preventDefault(event)

      this.setState({errors: undefined})

      const {context, props, state} = this
      const {location, onSubmitSuccess} = props
      const {formValues} = state

      dispatch(a.addDialog(ConfirmDialog, {
        question: u.xln(context, t.DELETE_TRANSACTION),
        onConfirm: () => {
          dispatch(a.deleteTransaction(formValues.id, u.xln(context, t.DELETING_TRANSACTION)))
            .then(() => {onSubmitSuccess()})
            .then(() => dispatch(a.addNotification(u.xln(context, t.TRANSACTION_DELETED))))
            .then(() => dispatch(a.fetchTransactions(location, u.xln(context, t.FETCHING_TRANSACTIONS))))
        },
      }))
    }

    this.onTypeUpdated = value => {
      const {formValues} = this.state
      const {type, outcomeAccountId, outcomeAmount, incomeAccountId, incomeAmount} = formValues

      if (f.includes([OUTCOME, LOAN], type) && f.includes([INCOME, BORROW], value)) {
        this.setState({
          formValues: {
            ...formValues,
            type: value,
            incomeAccountId : outcomeAccountId,
            incomeAmount    : outcomeAmount,
            outcomeAccountId: incomeAccountId,
            outcomeAmount   : incomeAmount,
          },
        })
        return
      }

      if (f.includes([INCOME, BORROW], type) && f.includes([OUTCOME, LOAN], value)) {
        this.setState({
          formValues: {
            ...formValues,
            type: value,
            outcomeAccountId: incomeAccountId,
            outcomeAmount   : incomeAmount,
            incomeAccountId : outcomeAccountId,
            incomeAmount    : outcomeAmount,
          },
        })
        return
      }

      if (f.includes([OUTCOME, LOAN], type) && value === TRANSFER) {
        this.setState({
          formValues: {
            ...formValues,
            type: value,
            incomeAmount: outcomeAmount,
          },
        })
        return
      }

      if (f.includes([INCOME, BORROW], type) && value === TRANSFER) {
        this.setState({
          formValues: {
            ...formValues,
            type: value,
            outcomeAmount: incomeAmount,
          },
        })
        return
      }

      this.setState({formValues: {
        ...formValues,
        type: value,
      }})
    }
  }

  render() {
    const {
      context,
      state: {formValues: {type, id}, errors},
      props: {categories, accounts, payees, pending},
      onSubmit, onDelete, onTypeUpdated,
    } = this

    const isMobile = u.isMobile(context)
    const disabled = pending

    return (
      <form className='col-start-stretch' onSubmit={onSubmit}>
        <div className={`col-start-stretch ${isMobile ? 'padding-v-1 padding-h-1x25' : 'padding-v-1x25'}`}>
          <FormDateElement
            name='date'
            label={u.xln(context, t.DATE)}
            disabled={disabled}
            {...u.bindValue(this, ['formValues', 'date'])} />
          <G7FormLine>
            <FormLabel>
              Type
            </FormLabel>
            <div className='col-start-stretch gaps-v-0x5'>
              <div className={isMobile ? 'col-start-stretch gaps-v-0x5' : 'row-start-center gaps-h-1'}>
                <label className='row-start-center gaps-h-0x5'>
                  <Radio
                    name='type'
                    disabled={disabled}
                    {...u.bindChecked(this, ['formValues', 'type'], OUTCOME)}
                    onUpdate={onTypeUpdated} />
                  <span>{u.xln(context, t.OUTCOME)}</span>
                </label>
                <label className='row-start-center gaps-h-0x5'>
                  <Radio
                    name='type'
                    disabled={disabled}
                    {...u.bindChecked(this, ['formValues', 'type'], INCOME)}
                    onUpdate={onTypeUpdated} />
                  <span>{u.xln(context, t.INCOME)}</span>
                </label>
                <label className='row-start-center gaps-h-0x5'>
                  <Radio
                    name='type'
                    disabled={disabled}
                    {...u.bindChecked(this, ['formValues', 'type'], TRANSFER)}
                    onUpdate={onTypeUpdated} />
                  <span>{u.xln(context, t.TRANSFER)}</span>
                </label>
              </div>
              <div className={isMobile ? 'col-start-stretch gaps-v-0x5' : 'row-start-center gaps-h-1'}>
                <label className='row-start-center gaps-h-0x5'>
                  <Radio
                    name='type'
                    disabled={disabled}
                    {...u.bindChecked(this, ['formValues', 'type'], LOAN)}
                    onUpdate={onTypeUpdated} />
                  <span>{u.xln(context, t.I_LOANED)}</span>
                </label>
                <label className='row-start-center gaps-h-0x5'>
                  <Radio
                    name='type'
                    disabled={disabled}
                    {...u.bindChecked(this, ['formValues', 'type'], BORROW)}
                    onUpdate={onTypeUpdated} />
                  <span>{u.xln(context, t.I_BORROWED)}</span>
                </label>
              </div>
            </div>
          </G7FormLine>

          {!f.includes([OUTCOME, LOAN, TRANSFER], type) ? null :
          <Fragment>
            <FormTextElement
              type='number'
              inputmode='numeric'
              step='0.01'
              name='outcomeAmount'
              label={u.xln(context, t.AMOUNT)}
              disabled={disabled}
              {...u.bindValue(this, ['formValues', 'outcomeAmount'], u.parseNum)} />
            <FormSelectElement
              name='outcomeAccountId'
              label={u.xln(context, t.ACCOUNT)}
              disabled={disabled}
              {...u.bindValue(this, ['formValues', 'outcomeAccountId'])}>
              <option value='' />
              {f.map(accounts, ({id, title}) => (
                <option value={id} key={`outcome-account-${id}`}>
                  {title}
                </option>
              ))}
            </FormSelectElement>
          </Fragment>}

          {!f.includes([INCOME, BORROW, TRANSFER], type) ? null :
          <Fragment>
            <FormTextElement
              type='number'
              inputmode='numeric'
              step='0.01'
              name='incomeAmount'
              label={u.xln(context, t.AMOUNT)}
              disabled={disabled}
              {...u.bindValue(this, ['formValues', 'incomeAmount'], u.parseNum)} />
            <FormSelectElement
              name='incomeAccountId'
              label={u.xln(context, t.ACCOUNT)}
              disabled={disabled}
              {...u.bindValue(this, ['formValues', 'incomeAccountId'])}>
              <option value='' />
              {f.map(accounts, ({id, title}) => (
                <option value={id} key={`income-account-${id}`}>
                  {title}
                </option>
              ))}
            </FormSelectElement>
          </Fragment>}

          {!f.includes([OUTCOME, INCOME], type) ? null :
          <FormSelectElement
            name='categoryId'
            label={u.xln(context, t.CATEGORY)}
            disabled={disabled}
            {...u.bindValue(this, ['formValues', 'categoryId'])}>
            <option value='' />
            {f.map(categories, ({id, title}) => (
              <option value={id} key={`category-${id}`}>
                {title}
              </option>
            ))}
          </FormSelectElement>}

          {!f.includes([OUTCOME, INCOME, LOAN, BORROW], type) ? null :
          <FormSelectElement
            name='payeeId'
            label={u.xln(context, t.PAYEE)}
            disabled={disabled}
            {...u.bindValue(this, ['formValues', 'payeeId'])}>
            <option value='' />
            {f.map(payees, ({id, title}) => (
              <option value={id} key={`payee-${id}`}>
                {title}
              </option>
            ))}
          </FormSelectElement>}

          <FormTextElement
            name='comment'
            label={u.xln(context, t.COMMENT)}
            disabled={disabled}
            {...u.bindValue(this, ['formValues', 'comment'])} />
        </div>
        <hr className='hr margin-h-1x25' />
        <div className='row-between-stretch padding-v-1 padding-h-1x25'>
          <div className='flex-1 row-start-stretch'>
            {!id ? null :
            <m.FakeButton
              className='btn-transparent'
              onClick={onDelete}
              disabled={disabled}>
              {u.xln(context, t.DELETE)}
            </m.FakeButton>}
          </div>
          <button
            type='submit'
            className={`btn-primary ${isMobile ? '' : 'btn-wide'}`}
            disabled={disabled}>
            {u.xln(context, t.SUBMIT)}
          </button>
          <div className='flex-1' />
        </div>
        {!errors ? null :
        <hr className='hr margin-h-1x25' />}
        <FormErrors errors={errors} />
      </form>
    )
  }
}

const TransactionForm = withRouter(connect(state => ({
  categories: state.net.categories,
  accounts: state.net.accounts,
  payees: state.net.payees,
  pending: !f.isEmpty(state.net.pending),
}))(_TransactionForm))

class TransactionPlaceholder extends u.ViewComponent {
  render() {
    const {context} = this

    const isMobile = u.isMobile(context)

    return (
      <div className='row-start-center gaps-h-1 padding-h-1 list-item'>
        <div className='row-start-center padding-v-1'>
          <div className='relative width-2x5 square circle decorate-placeholder' />
        </div>
        <div className='flex-1 col-start-stretch transaction-line-height'>
          <div className='col-start-stretch gaps-v-0x25 padding-v-1'>
            <div className='row-between-center gaps-h-1 font-midsmall fg-on-surface-pale'>
              <Placeholder style={{width: '4em'}} />
              <Placeholder style={{width: '6em'}} />
            </div>
            <div className='row-between-start gaps-h-1'>
              <Placeholder style={{width: '8em'}} />
              <Placeholder style={{width: '3em'}} />
            </div>
          </div>
          <hr className='hr hide-in-list-last-child' />
        </div>
        {isMobile ? null :
        <div className='row-center-center padding-v-1 padding-h-0x25'>
          <div className='row-center-center' style={{minHeight: '2.5rem'}}>
            <s.Trash2 className='font-large fg-transparent' />
          </div>
        </div>}
      </div>
    )
  }
}

class _Transaction extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)
    this.actionsRef = React.createRef()

    const {context} = this

    this.onOpen = transaction => event => {
      const actionsNode = u.findDomNode(this.actionsRef.current)
      if (u.isAncestorOf(actionsNode, event.target)) return

      dispatch(a.addDialog(FormDialog, {
        form: TransactionForm,
        formProps: {transaction},
        title: u.xln(context, t.EDIT_TRANSACTION),
      }))
    }

    this.onDelete = transaction => () => {
      const {props} = this
      const {location} = props

      dispatch(a.addDialog(ConfirmDialog, {
        question: u.xln(context, t.DELETE_TRANSACTION),
        onConfirm: () => {
          dispatch(a.deleteTransaction(transaction.id, u.xln(context, t.DELETING_TRANSACTION)))
            .then(() => dispatch(a.addNotification(u.xln(context, t.TRANSACTION_DELETED))))
            .then(() => dispatch(a.fetchTransactions(location, u.xln(context, t.FETCHING_TRANSACTIONS))))
        },
      }))
    }
  }

  render() {
    const {
      context,
      props: {transaction},
      onOpen, onDelete, actionsRef,
    } = this

    const isMobile = u.isMobile(context)

    return (
      <m.FakeButton
        type='div'
        onClick={onOpen(transaction)}
        className='row-start-start gaps-h-1 padding-h-1 list-item trigger text-left theme-drawer-link-busy rounded'>
        <div className='row-start-center padding-v-1'>
          <TransactionIcon transaction={transaction} />
        </div>
        <div className='flex-1 col-start-stretch transaction-line-height'>
          <div className='col-start-stretch gaps-v-0x25 padding-v-1'>
            <div className='row-between-center gaps-h-1 font-midsmall fg-on-surface-pale'>
              <TransactionOrigin transaction={transaction} />
              <TransactionAccount transaction={transaction} />
            </div>
            <div className='row-between-start gaps-h-1'>
              <TransactionMeta transaction={transaction} />
              <TransactionAmount transaction={transaction} />
            </div>
          </div>
          <hr className='hr hide-in-list-last-child' />
        </div>
        {isMobile ? null :
        <div className='row-center-center padding-v-1 padding-h-0x25' ref={actionsRef}>
          <div className='row-center-center' style={{minHeight: '2.5rem'}}>
            <m.FakeButton
              className='row-center-center show-on-trigger-hover decorate-icon-button'
              onClick={onDelete(transaction)}>
              <s.Trash2 className='font-large' />
            </m.FakeButton>
          </div>
        </div>}
      </m.FakeButton>
    )
  }
}

const Transaction = withRouter(connect()(_Transaction))

class TransactionMeta extends u.ViewComponent {
  render() {
    const {
      context,
      props: {transaction},
    } = this

    const isMobile = u.isMobile(context)

    return isMobile ? (
      <span className='col-start-start gaps-v-0x25'>
        <span>{transaction.date}</span>
        <span>{transaction.comment}</span>
      </span>
    ) : (
      <span>
        {transaction.date} {transaction.comment ? '·' : ''} {transaction.comment}
      </span>
    )
  }
}

class TransactionIcon extends u.ViewComponent {
  render() {
    const {
      props: {transaction},
    } = this

    return (
      <div className='row-start-center'>
        {f.includes([OUTCOME, LOAN], transaction.type) ? (
        <div className='relative width-2x5 square circle bg-primary'>
          <div className='row-center-center abs-center fg-on-primary font-large'>
            <s.Minus />
          </div>
        </div>
        ) : f.includes([INCOME, BORROW], transaction.type) ? (
        <div className='relative width-2x5 square circle bg-primary'>
          <div className='row-center-center abs-center fg-on-primary font-large'>
            <s.Plus />
          </div>
        </div>
        ) : (
        <div className='relative width-2x5 square circle bg-primary'>
          <div className='row-center-center abs-center fg-on-primary font-large'>
            <s.Repeat />
          </div>
        </div>
        )}
      </div>
    )
  }
}

class TransactionAmount extends u.ViewComponent {
  render() {
    const {
      props: {transaction},
    } = this

    return (
      <span className='wspace-nowrap'>
        { transaction.type === BORROW
        ? <span className='fg-success'>+{transaction.outcomeAmount}</span>
        : transaction.type === LOAN
        ? <span className='fg-error'>-{transaction.incomeAmount}</span>
        : transaction.type === INCOME
        ? <span className='fg-success'>+{transaction.incomeAmount}</span>
        : transaction.type === OUTCOME
        ? <span className='fg-error'>-{transaction.outcomeAmount}</span>
        : <span>{transaction.outcomeAmount || transaction.incomeAmount}</span>}
      </span>
    )
  }
}

class _TransactionAccount extends u.ViewComponent {
  render() {
    const {
      props: {transaction, accountsById},
    } = this

    const outcomeAccount = accountsById[transaction.outcomeAccountId]
    const incomeAccount  = accountsById[transaction.incomeAccountId]

    return (
      <span className='row-start-center gaps-h-0x25 wspace-nowrap'>
        {!outcomeAccount ? null :
        <span>{outcomeAccount.title}</span>}
        {!outcomeAccount || !incomeAccount ? null :
        <s.ArrowRight />}
        {!incomeAccount ? null :
        <span>{incomeAccount.title}</span>}
      </span>
    )
  }
}

const TransactionAccount = connect(state => ({
  accountsById: state.net.accountsById,
}))(_TransactionAccount)

class _TransactionOrigin extends u.ViewComponent {
  render() {
    const {
      props: {transaction, categoriesById, payeesById},
    } = this

    return (
      <span className='flex-1 width-0 text-ellipsis gaps-h-0x5'>
        {!categoriesById[transaction.categoryId] ? null :
        <span className='gaps-h-0x25'>
          <s.Tag className='theme-drawer-icon' />
          <span>{categoriesById[transaction.categoryId].title}</span>
        </span>}
        {!payeesById[transaction.payeeId] ? null :
        <span className='gaps-h-0x25'>
          <s.Users className='theme-drawer-icon' />
          <span>{payeesById[transaction.payeeId].title}</span>
        </span>}
      </span>
    )
  }
}

const TransactionOrigin = connect(state => ({
  categoriesById: state.net.categoriesById,
  payeesById: state.net.payeesById,
}))(_TransactionOrigin)

class _TransactionsList extends u.ViewComponent {
  render() {
    const {
      context,
      props: {outcomeAmount, incomeAmount, transactions, pageCount, pending},
    } = this

    const isMobile = u.isMobile(context)
    return (
      <div className='col-start-stretch gaps-v-2'>
        <div className='col-start-stretch gaps-v-0x25'>
          <div className={`row-between-center ${isMobile ? 'padding-t-0x5 padding-r-1' : 'padding-r-3x5'}`}>
            <FiltersControls />
            {pending ? null :
            <div className='gaps-h-0x5'>
              <span className='gaps-h-0x5'>
                <span className='fg-on-surface-pale'>{u.xln(context, t.OUTCOME)}:</span>
                <span className='fg-error'>-{outcomeAmount}</span>
              </span>
              <span className='fg-on-surface-pale'>/</span>
              <span className='gaps-h-0x5'>
                <span className='fg-on-surface-pale'>{u.xln(context, t.INCOME)}:</span>
                <span className='fg-success'>+{incomeAmount}</span>
              </span>
              <span className='fg-on-surface-pale'>
                ({u.xln(context, t.WITHOUT_DEBTS_AND_TRANSFERS)})
              </span>
            </div>}
          </div>
          {pending || !f.size(transactions) ? (
            <div className='col-start-stretch'>
              {f.map(new Array(f.size(transactions) || 3), (__, index) => (
                <TransactionPlaceholder key={`placeholder-${index}`} />
              ))}
            </div>
          ) : (
            <div className='col-start-stretch'>
              {f.map(transactions, transaction => (
                <Transaction key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
        {!f.size(transactions) ? null :
        <Paginator pageCount={pageCount} />}
      </div>
    )
  }
}

const TransactionsList = withRouter(connect(state => {
  return {
    outcomeAmount: state.net.transactions.outcomeAmount,
    incomeAmount : state.net.transactions.incomeAmount,
    transactions : state.net.transactions.items,
    pageCount    : Math.ceil(state.net.transactions.total / state.net.transactions.limit),
    pending      : !f.isEmpty(state.net.pending),
  }
})(_TransactionsList))



/**
 * Forms
 */

class G7FormLine extends u.ViewComponent {
  render() {
    const {
      context,
      props: {children},
    } = this

    if (u.isMobile(context)) {
      return (
        <div className='col-start-stretch gaps-v-0x5 mobile-form-element-spacing'>
          {children}
        </div>
      )
    }

    return (
      <div className='grid7 row-start-start form-element-spacing'>
        <div className='grid7-2 col-start-stretch padding-l-1x25 text-right'>
          {f.get(children, 0)}
        </div>
        <div className='grid7-4 col-start-stretch'>
          {f.get(children, 1)}
        </div>
        <div className='flex-1 col-start-start padding-r-1x25'>
          {f.get(children, 2)}
        </div>
      </div>
    )
  }
}

class FormLabel extends u.ViewComponent {
  render() {
    const {
      context,
      props: {children, className: cls, ...props},
    } = this

    if (u.isMobile(context)) {
      return (
        <label className={`row-start-center fg-on-surface-pale ${cls || ''}`} {...props}>
          {children}:
        </label>
      )
    }

    return (
      <label className={`row-end-center fg-on-surface-pale ${cls || ''}`} {...props}>
        {children}:
      </label>
    )
  }
}

class FormTextElement extends u.ViewComponent {
  constructor({onUpdate}) {
    super(...arguments)

    this.onChange = ({target: {value}}) => {
      if (!onUpdate) return
      f.validate(onUpdate, f.isFunction)
      onUpdate(value)
    }
  }

  render() {
    const {
      onChange,
      props: {label, name, type, step, value, defaultValue, readOnly, disabled},
    } = this

    return (
      <G7FormLine>
        <FormLabel className='input-height' htmlFor={name}>
          {label}
        </FormLabel>
        <input
          id={name}
          name={name}
          type={type || 'text'}
          step={step}
          className='input'
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          readOnly={readOnly}
          disabled={disabled} />
      </G7FormLine>
    )
  }
}

class FormDateElement extends u.ViewComponent {
  constructor() {
    super(...arguments)
    const {props: {onUpdate}} = this

    this.state = {}

    this.years  = f.reverse(f.range(1940, new Date().getFullYear() + 1))
    this.months = [
      {value: 0,  key: 'January'},
      {value: 1,  key: 'February'},
      {value: 2,  key: 'March'},
      {value: 3,  key: 'April'},
      {value: 4,  key: 'May'},
      {value: 5,  key: 'June'},
      {value: 6,  key: 'July'},
      {value: 7,  key: 'August'},
      {value: 8,  key: 'September'},
      {value: 9,  key: 'October'},
      {value: 10, key: 'November'},
      {value: 11, key: 'December'},
    ]

    this.onYearInput = ({target: {value: year}}) => {
      year = u.parseNum(year)
      const month = this.mayBeMonth(year, this.state.month)
      const days  = u.daysInMonthList(year, month)
      const day   = this.mayBeDay(days, this.state.day)
      this.setState({year, month, day, days})
      this.onDateInput(year, month, day)
    }

    this.onMonthInput = ({target: {value: month}}) => {
      month = u.parseNum(month)
      const year = this.state.year
      const days = u.daysInMonthList(year, month)
      const day  = this.mayBeDay(days, this.state.day)
      this.setState({month, day, days})
      this.onDateInput(year, month, day)
    }

    this.onDayInput = ({target: {value: day}}) => {
      day = u.parseNum(day)
      const {year, month} = this.state
      this.setState({day})
      this.onDateInput(year, month, day)
    }

    this.onDateInput = (year, month, day) => {
      if (!onUpdate) return
      f.validate(onUpdate, f.isFunction)

      if (year != null && month != null && day != null) {
        const date = u.addBrowserOffset(new Date(year, month, day))
        onUpdate(date)
      }
      else {
        onUpdate(undefined)
        console.warn('Entered date is invalid')
      }
    }

    this.mayBeMonth = (year, month) => {
      return year == null ? undefined : month
    }

    this.mayBeDay = (days, day) => {
      return f.includes(days, day) ? day : undefined
    }
  }

  static getDerivedStateFromProps(props, state) {
    const {value, defaultValue} = props

    if (value || defaultValue !== state.prevPropsValue) {
      const date = u.toValidDate(value || defaultValue)
      const {year, month, day} = date
        ? {year: date.getFullYear(), month: date.getMonth(), day: date.getDate()}
        : {year: undefined, month: undefined, day: undefined}
      const days = u.daysInMonthList(year, month)

      return {prevPropsValue: value || defaultValue, days, day, month, year}
    }

    return state
  }

  render() {
    const {
      context,
      props,
      state,
      years, months, onYearInput, onMonthInput, onDayInput,
    } = this

    const {label, readOnly, disabled} = props
    const {days, year, month, day} = state

    return (
      <G7FormLine>
        <FormLabel className='input-height'>
          {label}
        </FormLabel>
        <div className='row-start-stretch gaps-h-0x5'>
          <select
            className='flex-3 select-native'
            onChange={onYearInput}
            value={year == null ? '' : year}
            disabled={readOnly || disabled}>
            <option value=''>
              {u.xln(context, t.YEAR)}:
            </option>
            {f.map(years, year => (
              <option
                key={year}
                value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            className='flex-5 select-native'
            value={month == null ? '' : month}
            onChange={onMonthInput}
            disabled={readOnly || disabled}>
            <option value=''>
              {u.xln(context, t.MONTH)}:
            </option>
            {f.map(months, ({value, key}) => (
              <option
                key={key}
                value={value}>
                {u.xln(context, t[key.toUpperCase()])}
              </option>
            ))}
          </select>
          <select
            className='flex-3 select-native'
            value={day == null ? '' : day}
            onChange={onDayInput}
            disabled={readOnly || disabled}>
            <option value=''>
              {u.xln(context, t.DAY)}:
            </option>
            {f.map(days, day => (
              <option
                key={day}
                value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </G7FormLine>
    )
  }
}

class FormSelectElement extends u.ViewComponent {
  constructor({onUpdate}) {
    super(...arguments)
    this.onChange = ({target: {value}}) => {
      if (!onUpdate) return
      f.validate(onUpdate, f.isFunction)
      onUpdate(value)
    }
  }

  render() {
    const {
      onChange,
      props: {label, name, value, defaultValue, readOnly, disabled, children},
    }= this

    return (
      <G7FormLine>
        <FormLabel className='input-height' htmlFor={name}>
          {label}
        </FormLabel>
        <select
          id={`${name}_${value}`}
          name={name}
          className='select-native'
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          readOnly={readOnly}
          disabled={disabled}>
          {children}
        </select>
      </G7FormLine>
    )
  }
}

class FormErrors extends u.ViewComponent {
  render() {
    const {props: {errors}} = this

    return !errors ? null : (
      <div className='col-start-center padding-v-1 fg-accent font-midsmall'>
        {f.map(errors, ({text}, index) => (
          <p key={`error-${index}`}>{text}</p>
        ))}
      </div>
    )
  }
}

class Radio extends u.ViewComponent {
  constructor({onUpdate}) {
    super(...arguments)
    this.onChange = ({target: {value}}) => {
      if (!onUpdate) return
      f.validate(onUpdate, f.isFunction)
      onUpdate(value)
    }
  }

  render() {
    const {
      onChange,
      props: {name, value, readOnly, disabled, checked, defaultChecked},
    } = this

    return (
      <label className='radio'>
        <input
          id={`${name}_${value}`}
          name={name}
          value={value}
          type='radio'
          className='radio-input'
          onChange={onChange}
          checked={checked}
          defaultChecked={defaultChecked}
          readOnly={readOnly}
          disabled={disabled} />
        <span className='radio-decorator' />
      </label>
    )
  }
}



/**
 * Dialogs
 */

class _FormDialog extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    this.close = () => {
      dispatch(a.removeDialog())

      if (this.props.onClose) this.props.onClose()
    }
  }

  render() {
    const {
      context,
      props: {title, form: Form, formProps},
      close,
    } = this

    if (u.isMobile(context)) {
      return (
        <m.Dialog onEscape={close}>
          <m.DialogScrollable className='bg-surface'>
            <div className='relative col-start-stretch'>
              <div className='row-between-center gaps-h-1 padding-l-1x25 navbar-height'>
                <h2 className='font-large weight-medium'>
                  {title}
                </h2>
                <m.FakeButton className='row-center-center padding-1x25' onClick={close}>
                  <s.X className='font-large' />
                </m.FakeButton>
              </div>
              <hr className='hr' />
              {!Form ? null :
              <Form {...formProps} onSubmitSuccess={close} />}
            </div>
          </m.DialogScrollable>
        </m.Dialog>
      )
    }

    return (
      <m.Dialog onEscape={close}>
        <m.DialogOverlay className='bg-overlay' />
        <m.DialogCentered onClick={close}>
          <div
            className='col-start-stretch rounded bg-surface shadow-dept-3'
            style={{minWidth: '31rem'}}>
            <div className='row-between-center gaps-h-1 padding-h-1x25 navbar-height'>
              <h2 className='font-large weight-medium'>
                {title}
              </h2>
              <m.FakeButton className='row-center-center' onClick={close}>
                <s.X className='font-large' />
              </m.FakeButton>
            </div>
            <hr className='hr' />
            {!Form ? null :
            <Form {...formProps} onSubmitSuccess={close} />}
          </div>
        </m.DialogCentered>
      </m.Dialog>
    )
  }
}

const FormDialog = connect()(_FormDialog)

class _ConfirmDialog extends u.ViewComponent {
  constructor({dispatch}) {
    super(...arguments)

    this.close = () => {
      dispatch(a.removeDialog())
      if (this.props.onClose) this.props.onClose()
    }

    this.confirm = () => {
      dispatch(a.removeDialog())
      if (this.props.onConfirm) this.props.onConfirm()
    }
  }

  render() {
    const {
      context,
      props: {question, cancelText, confirmText},
      confirm, close,
    } = this

    return (
      <m.Dialog onEscape={close}>
        <m.DialogOverlay className='bg-overlay' />
        <m.DialogCentered onClick={close}>
          <div
            className='col-start-stretch gaps-v-1 padding-v-1 rounded bg-surface shadow-dept-3'
            style={{minWidth: '11rem'}}>
            <p className='padding-h-1x25 font-midlarge weight-medium'>
              {question}
            </p>
            <div className='row-center-center gaps-h-1'>
              <m.FakeButton className='btn-secondary' onClick={close}>
                {cancelText || u.xln(context, t.CANCEL)}
              </m.FakeButton>
              <m.FakeButton className='btn-primary' onClick={confirm}>
                {confirmText || u.xln(context, t.OK)}
              </m.FakeButton>
            </div>
          </div>
        </m.DialogCentered>
      </m.Dialog>
    )
  }
}

const ConfirmDialog = connect()(_ConfirmDialog)



/**
 * Misc
 */

class ListPage extends u.ViewComponent {
  render() {
    const {
      context,
      props: {action, children},
    } = this

    if (u.isMobile(context)) {
      return (
        <MobilePageLayout action={action}>
          <div className='col-start-stretch padding-v-0x5'>
            {children}
          </div>
        </MobilePageLayout>
      )
    }

    return (
      <PageLayout className='relative col-start-center padding-r-1x25'>
        <div className='limit-content-width col-start-stretch gaps-v-1 padding-b-2'>
          <div className='col-start-stretch padding-h-0x5' style={{marginTop: '-1.75rem'}}>
            {action}
          </div>
          {children}
        </div>
      </PageLayout>
    )
  }
}

class _Paginator extends u.ViewComponent {
  constructor() {
    super(...arguments)

    const query = u.decodeQuery(this.props.location.search)
    this.state = {forcePage: parseInt(query.page, 10) || 1}

    this.onPageChange = ({selected}) => {
      const {props} = this
      const {history, location, onPageChange} = props

      const query = u.decodeQuery(location.search)
      const page = selected + 1
      history.push(`/transactions/${u.encodeQuery({...query, page})}`)

      if (f.isFunction(onPageChange)) onPageChange(page)
    }

    this.hrefBulder = page => {
      const query = u.decodeQuery(this.props.location.search)
      return `/transactions/${u.encodeQuery({...query, page})}`
    }
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(nextLocation => {
      const location = this.props.location
      if (location.pathname !== nextLocation.pathname) return

      const nextQuery = u.decodeQuery(nextLocation.search)
      this.setState({forcePage: parseInt(nextQuery.page, 10) || 1})
    })
  }

  componentWillUnmount() {
    this.unlisten()
  }

  render() {
    const {
      context,
      props: {pageCount}, state: {forcePage},
      onPageChange, hrefBulder,
    } = this

    const isMobile = u.isMobile(context)

    return (
      <ReactPaginate
        pageCount={pageCount}
        pageRangeDisplayed={isMobile ? 2 : 3}
        marginPagesDisplayed={isMobile ? 1 : 2}
        previousLabel={<s.ArrowLeft />}
        nextLabel={<s.ArrowRight />}
        breakLabel='...'
        breakClassName={`block ${isMobile ? '' : 'padding-h-0x75'}`}
        breakLinkClassName='btn-secondary row-center-center'
        onPageChange={onPageChange}
        forcePage={forcePage - 1}
        disableInitialCallback={true}
        containerClassName={`${isMobile
          ? 'col-start-stretch gaps-v-1 padding-h-1x25'
          : 'row-center-center gaps-h-0x25'}`}
        pageClassName='block'
        pageLinkClassName='btn-secondary row-center-center'
        previousClassName='block'
        previousLinkClassName='btn-secondary row-center-center'
        nextClassName='block'
        nextLinkClassName='btn-secondary row-center-center'
        hrefBuilder={hrefBulder}
        ariaLabelBuilder={page => `${u.xln(context, t.PAGE)} ${page}`}
      />
    )
  }
}

const Paginator = withRouter(_Paginator)

class _FiltersForm extends u.ViewComponent {
  constructor() {
    super(...arguments)

    this.state = {
      formValues: getFilterValues(this.props.location),
    }

    this.onSubmit = event => {
      event.preventDefault()

      const {props, state} = this
      const {history, location, onSubmitSuccess} = props
      const {formValues} = state

      const query = u.decodeQuery(location.search)
      history.push(`/transactions/${u.encodeQuery({
        ...query,
        ...formValues,
        dateFrom: u.formatDate(formValues.dateFrom),
        dateTo  : u.formatDate(formValues.dateTo),
        page    : undefined,
      })}`)

      if (f.isFunction(onSubmitSuccess)) onSubmitSuccess(this.state.formValues)
    }

    this.onReset = event => {
      event.preventDefault()

      const {props} = this
      const {history, location} = props

      resetFilters(history, location)
    }
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen(nextLocation => {
      const location = this.props.location
      if (location.pathname !== nextLocation.pathname) return

      this.setState({
        formValues: getFilterValues(nextLocation),
      })
    })
  }

  componentWillUnmount() {
    this.unlisten()
  }

  render() {
    const {
      context,
      props: {accounts, categories, payees, pending},
      state: {formValues},
      onSubmit, onReset,
    } = this

    const isMobile = u.isMobile(context)
    const noFilters = f.isEmpty(u.omitEmpty(formValues))
    return (
      <form className='col-start-stretch' onSubmit={onSubmit} onReset={onReset}>
        <div className={`col-start-stretch ${isMobile ? 'padding-v-1 padding-h-1x25' : 'padding-v-1x25'}`}>
          <FormDateElement
            name='dateFrom'
            label={u.xln(context, t.DATE_FROM)}
            disabled={pending}
            {...u.bindValue(this, ['formValues', 'dateFrom'])} />

          <FormDateElement
            name='dateTo'
            label={u.xln(context, t.DATE_TO)}
            disabled={pending}
            {...u.bindValue(this, ['formValues', 'dateTo'])} />

          <FormSelectElement
            name='accountId'
            label={u.xln(context, t.ACCOUNT)}
            disabled={pending}
            {...u.bindValue(this, ['formValues', 'accountId'])}>
            <option value='' />
            {f.map(accounts, ({id, title}) => (
              <option value={id} key={`income-account-${id}`}>
                {title}
              </option>
            ))}
          </FormSelectElement>

          <FormSelectElement
            name='categoryId'
            label={u.xln(context, t.CATEGORY)}
            disabled={pending}
            {...u.bindValue(this, ['formValues', 'categoryId'])}>
            <option value='' />
            {f.map(categories, ({id, title}) => (
              <option value={id} key={`category-${id}`}>
                {title}
              </option>
            ))}
          </FormSelectElement>

          <FormSelectElement
            name='payeeId'
            label={u.xln(context, t.PAYEE)}
            disabled={pending}
            {...u.bindValue(this, ['formValues', 'payeeId'])}>
            <option value='' />
            {f.map(payees, ({id, title}) => (
              <option value={id} key={`payee-${id}`}>
                {title}
              </option>
            ))}
          </FormSelectElement>

          <FormTextElement
            name='comment'
            label={u.xln(context, t.COMMENT)}
            disabled={pending}
            {...u.bindValue(this, ['formValues', 'comment'])} />
        </div>
        <hr className='hr margin-h-1x25' />
        <div className='row-between-stretch padding-v-1 padding-h-1x25'>
          <div className='flex-1 row-start-stretch'>
            <button
              type='reset'
              className='btn-transparent'
              disabled={pending || noFilters}>
              {u.xln(context, t.RESET)}
            </button>
          </div>
          <button
            type='submit'
            className={`btn-primary ${isMobile ? '' : 'btn-wide'}`}
            disabled={pending}>
            {u.xln(context, t.APPLY)}
          </button>
          <div className='flex-1' />
        </div>
      </form>
    )
  }
}

const FiltersForm = withRouter(connect(state => ({
  categories: state.net.categories,
  accounts: state.net.accounts,
  payees: state.net.payees,
  pending: !f.isEmpty(state.net.pending),
}))(_FiltersForm))

class _FiltersControls extends u.ViewComponent {
  render() {
    const {
      context,
      props: {transactions, pending, dispatch, history, location},
    } = this

    const noFilters = f.isEmpty(u.omitEmpty(getFilterValues(location)))

    return (
      <div className='row-start-center padding-h-1 flex-wrap'>
        <div className='row-start-center gaps-h-0x5'>
          <m.FakeButton
            className='decorate-link'
            disabled={pending || !f.size(transactions)}
            onClick={() => dispatch(a.addDialog(FormDialog, {
              form: FiltersForm,
              title: u.xln(context, t.FILTERS),
            }))}>
            {u.xln(context, t.FILTERS)}
          </m.FakeButton>
          {noFilters ? null :
          <m.FakeButton
            className='decorate-link row-center-center bg-primary rounded-50p'
            style={{padding: '2px'}}
            disabled={pending}
            onClick={() => resetFilters(history, location)}>
            <s.X className='fg-surface' />
          </m.FakeButton>}
        </div>
      </div>
    )
  }
}

const FiltersControls = withRouter(connect(state => ({
  transactions: state.net.transactions.items,
  pending: !f.isEmpty(state.net.pending),
}))(_FiltersControls))

function getFilterValues(location) {
  const query = u.decodeQuery(location.search)

  return {
    dateFrom  : u.toValidDate(query.dateFrom),
    dateTo    : u.toValidDate(query.dateTo),
    accountId : query.accountId,
    categoryId: query.categoryId,
    payeeId   : query.payeeId,
    comment   : query.comment,
  }
}

function resetFilters(history, location) {
  const query = u.decodeQuery(location.search)
  history.push(`/transactions/${u.encodeQuery({
    ...query,
    dateFrom  : undefined,
    dateTo    : undefined,
    accountId : undefined,
    categoryId: undefined,
    payeeId   : undefined,
    comment   : undefined,
    page      : undefined,
  })}`)
}

class Fab extends u.ViewComponent {
  render() {
    const {props: {className: cls, ...props}} = this

    return (
      <m.FakeButton
        className={`row-start-stretch width-3x5 ${cls || ''}`}
        {...props}>
        <span className='flex-1 relative circle square bg-accent shadow-dept-2'>
          <s.Plus className='abs-center font-giant fg-on-accent' />
        </span>
      </m.FakeButton>
    )
  }
}

// TODO Unused. Candidate to delete
class _ActionsMenu extends u.ViewComponent {
  constructor() {
    super(...arguments)

    this.state = {expanded: false}

    this.close = () => {
      this.setState({expanded: false})
    }

    this.toggle = () => {
      this.setState({expanded: !this.state.expanded})
    }
  }

  render() {
    const {
      props: {children},
      state: {expanded},
      toggle, close,
    } = this

    return !children ? null : (
      <div className='relative row-start-stretch'>
        <m.FakeButton
          onClick={toggle}
          className='relative row-start-center decorate-drawer-link z-index-2'
          aria-expanded={expanded}>
          <s.MoreVertical className='font-large' />
        </m.FakeButton>
        {!expanded ? null :
        <m.Closer root={this} close={close}>
          <div
            className='dropdown-position z-index-1'
            onClick={close}>
            <div className='dropdown dropdown-padding col-start-stretch' style={{minWidth: '11rem'}}>
              {children}
            </div>
          </div>
        </m.Closer>}
      </div>
    )
  }
}

export class Page404 extends u.ViewComponent {
  render() {
    const {context} = this

    const content = (
      <Fragment>
        <div className='col-start-center gaps-v-0x5'>
          <h2 style={{lineHeight: '1', fontSize: '3em'}}>404</h2>
          <p>Page Not Found</p>
        </div>
        <p className='row-center-center'>
          <Link to='/' className='btn-primary'>Dashboard</Link>
        </p>
      </Fragment>
    )

    if (u.isMobile(context)) {
      return (
        <MobilePageLayout>
          <div className='col-start-stretch gaps-v-1 padding-v-3'>
            {content}
          </div>
        </MobilePageLayout>
      )
    }

    return (
      <PageLayout className='relative col-start-center padding-r-1x25'>
        <div className='limit-content-width col-start-center gaps-v-1 padding-v-3'>
          {content}
        </div>
      </PageLayout>
    )
  }
}