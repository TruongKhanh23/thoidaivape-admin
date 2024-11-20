import { mutations as isLoggedIn } from '@/store/isLoggedIn/mutations';
import { mutations as user } from '@/store/user/mutations';

export const mutations = {
    ...user,
    ...isLoggedIn
};
