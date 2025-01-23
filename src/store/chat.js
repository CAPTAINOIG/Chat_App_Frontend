import { create } from "zustand";
import {shallow} from 'zustand/shallow';

const useMessageStore = create((set) => ({
    data: {
           messages: null,
        },
    updateMessage: (payload) => set((state) => ({ data: { ...state.data, ...payload } })),
}),
shallow
);

export default useMessageStore;