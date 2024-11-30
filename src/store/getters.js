import { getters as isLoggedIn } from '@/store/isLoggedIn/getters';
import { getters as account } from '@/store/account/getters';
import { getters as brands } from '@/store/brands/getters';
import { getters as collections } from '@/store/collections/getters';

export const getters = {
    ...collections,
    ...account,
    ...brands,
    ...isLoggedIn
};
