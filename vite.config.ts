import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/brief_sales/",
  plugins: [react()],
});
