import { actions as account } from '@/store/account/actions';
import { actions as brands } from '@/store/brands/actions';
import { actions as collections } from '@/store/collections/actions';
import { actions as isLoggedIn } from '@/store/isLoggedIn/actions';

export const actions = {
    ...collections,
    ...account,
    ...brands,
    ...isLoggedIn
};
