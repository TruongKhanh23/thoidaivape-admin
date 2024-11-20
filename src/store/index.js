import { actions } from '@/store/actions';
import { getters } from '@/store/getters';
import { mutations } from '@/store/mutations';
import { state } from '@/store/state';
import { createStore } from 'vuex';
import VuexPersist from 'vuex-persist';

const vuexPersist = new VuexPersist({
    key: 'thoidaivape-admin',
    storage: localStorage
});

const store = createStore({
    state,
    mutations,
    actions,
    getters,
    plugins: [vuexPersist.plugin]
});

export default store;
