import { mutations as isLoggedIn } from '@/store/isLoggedIn/mutations';
import { mutations as account } from '@/store/account/mutations';
import { mutations as brands } from '@/store/brands/mutations';

export const mutations = {
    ...account,
    ...brands,
    ...isLoggedIn
};
