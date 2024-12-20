import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { exampleNotifications } from "../../assets/assets"

interface NotifProps {
    receiver: string,
     sender: string,
     type: string,
     post?: string,
     message: string,
     read: boolean,
     createdAt: string
}



const initialState = {
    notification:[]as NotifProps [],
    loading: false,
    error: null as string | null,

}


export const fetchNotifs = createAsyncThunk(
    "notification/fetch",
    async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const notifications = exampleNotifications.map((notification) => ({
            ...notification, createdAt: notification.createdAt.toISOString(),
        }))
        return notifications
    }
)



const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchNotifs.pending,(state) => {
            console.log("Fetching notif Data")
            state.loading = true;
        })
        .addCase(fetchNotifs.fulfilled, (state, action) => {
            state.notification = action.payload
            state.loading = false;
        })
    }
})


export default notificationSlice.reducer