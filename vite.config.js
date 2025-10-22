/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist', // 输出目录设置为项目根目录
    emptyOutDir: true, // 清空输出目录
  },
  root: './client', // 设置 Vite 的根目录为 client 文件夹
  publicDir: 'public', // 指定静态文件目录
})
