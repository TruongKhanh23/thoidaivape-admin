import { getters as isLoggedIn } from '@/store/isLoggedIn/getters';
import { getters as account } from '@/store/account/getters';
import { getters as brands } from '@/store/brands/getters';

export const getters = {
    ...account,
    ...brands,
    ...isLoggedIn
};
