import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./store/store.ts";
import { BrowserRouter } from "react-router-dom";
import { setupIntercpetor } from "./utils/axiosHelper.ts";
import { SocketProvider } from "./context/SocketContext.tsx";

setupIntercpetor(store);

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Provider store={store}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </Provider>
  </BrowserRouter>
);
