import { createSlice } from '@reduxjs/toolkit'

export interface LangState {
  lang: string
}

const initialState: LangState = JSON.parse(window.localStorage.getItem('dareadventure-lang')!) || {
    lang: 'en'
}

export const langSlice = createSlice({
  name: 'lang',
  initialState,
  reducers: {
    switchLanguage: (state, action:any) => {
      window.localStorage.setItem('dareadventure-lang', action.payload);
      state.lang = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { switchLanguage } = langSlice.actions

export default langSlice.reducer