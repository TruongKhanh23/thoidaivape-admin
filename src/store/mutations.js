import { mutations as isLoggedIn } from '@/store/isLoggedIn/mutations';
import { mutations as account } from '@/store/account/mutations';
import { mutations as brands } from '@/store/brands/mutations';
import { mutations as collections } from '@/store/collections/mutations';

export const mutations = {
    ...collections,
    ...account,
    ...brands,
    ...isLoggedIn
};
