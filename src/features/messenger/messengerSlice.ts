import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {  messages } from "../../assets/assets";

interface Chat {
    sender: string,
    receiver: string,
    content: string,
    isRead: boolean,
    createdAt: string,
}

const initialState =  {
    chats: [] as Chat[],
    loading: false, // Loading flag
    error: null as string | null,
}


// Async State
export const fetchChats = createAsyncThunk(
    "messenger/fetch",
    async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        //  serializable Date and then convert it back to a Date object
        const messagesSerial = messages.map((message) => ({
            ...message,   createdAt: message.createdAt.toISOString(), 
        }))
        return messagesSerial;
    }

)

const messageSlice = createSlice({
    name: 'messenger',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchChats.pending, (state) => {
                console.log('Fetching chats')
                state.loading = true;
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.chats = action.payload
                state.loading = false
    })
    }
})


export default messageSlice.reducer

