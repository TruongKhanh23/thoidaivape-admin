import { getters as isLoggedIn } from '@/store/isLoggedIn/getters';
import { getters as account } from '@/store/account/getters';

export const getters = {
    ...account,
    ...isLoggedIn
};
