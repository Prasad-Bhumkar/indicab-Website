import { createSlice } from '@reduxjs/toolkit';

const appSectionSlice = createSlice({
  name: 'appSection',
  initialState: {
    downloadCount: 0,
  },
  reducers: {
    incrementDownloadCount: (state) => {
      state.downloadCount += 1;
    },
  },
});

export const { incrementDownloadCount } = appSectionSlice.actions;

export default appSectionSlice.reducer;
