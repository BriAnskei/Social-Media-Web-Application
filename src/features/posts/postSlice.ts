import { createSlice } from '@reduxjs/toolkit';

interface textValue {
  text: string
}

const initialState: textValue = {
  text: '',
};

const postsSlice = createSlice({
  name: 'Example',
  initialState,
  reducers:  {
    toggle: () => {
      console.log('BUtton clicked')
    }
  }
})

export const { toggle } = postsSlice.actions
export default postsSlice.reducer