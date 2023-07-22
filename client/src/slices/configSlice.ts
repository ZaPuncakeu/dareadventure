import { createSlice } from '@reduxjs/toolkit'

export interface ConfigState {
  muted: boolean
  cameraOn: boolean
  deafen: boolean
}

const initialState: ConfigState = JSON.parse(window.localStorage.getItem('c-meet-config')!) || {
    muted: false,
    cameraOn: false,
    deafen: false
}

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setMute: (state) => {
        state.muted = !state.muted;
    },
    setCamera: (state) => {
        state.cameraOn = !state.cameraOn;
    },
    setDeafen: (state) => {
        state.deafen = !state.deafen;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setMute, setCamera, setDeafen } = configSlice.actions

export default configSlice.reducer