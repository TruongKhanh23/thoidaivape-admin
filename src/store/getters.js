import { getters as isLoggedIn } from '@/store/isLoggedIn/getters';
import { getters as user } from '@/store/user/getters';

export const getters = {
    ...user,
    ...isLoggedIn
};
