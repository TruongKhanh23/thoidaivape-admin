import { mutations as isLoggedIn } from '@/store/isLoggedIn/mutations';
import { mutations as account } from '@/store/account/mutations';

export const mutations = {
    ...account,
    ...isLoggedIn
};
