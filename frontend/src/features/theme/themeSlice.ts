import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Mode = "light" | "dark";

const stored = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
const initialMode: Mode = stored === "dark" ? "dark" : "light";

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: initialMode as Mode },
  reducers: {
    setTheme(state, action: PayloadAction<Mode>) {
      state.mode = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("theme", state.mode);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;