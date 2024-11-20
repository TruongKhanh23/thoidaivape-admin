import { actions as user } from '@/store/user/actions'
import { actions as isLoggedIn } from '@/store/isLoggedIn/actions'

export const actions = {
  ...user,
  ...isLoggedIn,
}
