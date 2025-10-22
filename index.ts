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

// 获取当前模块路径
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// 异步启动ApolloServer并监听
async function startServer() {
  const app = express()
  app.use(cors())

  // 将ApolloServer挂载到 / 路由
  app.use('/api', await createApolloServer()) // 使用await

  // 后端热加载
  const watcher = chokidar.watch('server') // Watch server folder
  watcher.on('ready', () => {
    watcher.on('all', () => {
      // 如果是 ES 模块，避免使用 require.cache
      // 可以使用动态 import 来处理模块缓存
      Object.keys(import.meta.url).forEach((id) => {
        if (id.includes('server')) {
          delete import.meta.url[id] // 动态删除缓存
        }
      })
    })
  })

  // 启动前端服务
  if (!inProduction) {
    console.log(`we are !inProduction ${!inProduction}`)
    // 启动Vite开发服务器
    const startVite = () => {
      const vite = exec('cd client && vite') // 启动Vite
      vite.stdout.pipe(process.stdout)
      vite.stderr.pipe(process.stderr)
    }

    startVite() // 启动前端开发服务器
  } else {
    console.log('生产环境ing')
    // 生产环境，提供静态文件
    const DIST_PATH = path.resolve(__dirname, './dist')
    const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')

    app.use(express.static(DIST_PATH))
    app.get('*', (req, res) => res.sendFile(INDEX_PATH))
  }

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
  })
}

// 调用异步启动函数
startServer()
