import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import aiEditorPlugin from './vite-plugin-ai-editor.js'

export default defineConfig({
  plugins: [react(), aiEditorPlugin()],
})
