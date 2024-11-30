import { actions as account } from '@/store/account/actions';
import { actions as brands } from '@/store/brands/actions';
import { actions as isLoggedIn } from '@/store/isLoggedIn/actions';

export const actions = {
    ...account,
    ...brands,
    ...isLoggedIn
};
