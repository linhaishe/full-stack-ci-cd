import 'dotenv/config'
import chokidar from 'chokidar'
import express from 'express'
import path from 'path'
import 'express-async-errors'
import { exec } from 'child_process' // 使用 import 导入
import cors from 'cors'
import { createApolloServer } from './server/index.ts'

// 从环境变量中获取端口和生产环境标志
import { PORT, inProduction } from './config/common.js'

// start server
const app = express()
app.use(cors())
app.use('/', await createApolloServer()) // 将服务器挂载到 /api 路由

// 后端热加载
const watcher = chokidar.watch('server') // Watch server folder
watcher.on('ready', () => {
  watcher.on('all', () => {
    Object.keys(require.cache).forEach((id) => {
      if (id.includes('server')) delete require.cache[id] // Delete all require caches that point to server folder (*)
    })
  })
})

// 启动前端服务
if (!inProduction) {
  // 启动Vite开发服务器
  const startVite = () => {
    const vite = exec('cd client && vite') // 启动Vite
    vite.stdout.pipe(process.stdout)
    vite.stderr.pipe(process.stderr)
  }

  startVite() // 启动前端开发服务器
} else {
  // 生产环境，提供静态文件
  const DIST_PATH = path.resolve(__dirname, './dist')
  const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')

  app.use(express.static(DIST_PATH))
  app.get('*', (req, res) => res.sendFile(INDEX_PATH))
}

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
