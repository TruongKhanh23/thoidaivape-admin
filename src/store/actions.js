import { actions as account } from '@/store/account/actions'
import { actions as isLoggedIn } from '@/store/isLoggedIn/actions'

export const actions = {
  ...account,
  ...isLoggedIn,
}
