import { Plugin, ViteDevServer } from 'vite'
import { IncomingMessage, ServerResponse } from 'http'
import childProcess from 'child_process'
import path from 'path'
import fs from 'fs'
import { getJsFunNameLog } from './functionLog'

const clientJs = fs.readFileSync(path.resolve(__dirname, './client.js'))
export default function addCodeLocation(): Plugin {
  return {
    name: 'vite-plugin-add-code-location',
    enforce: 'pre',
    apply: 'serve',
    transform(code: string, id: string) {
      if (id.endsWith('.vue')) {
        const filePath = id
        const res = getTemplateStartEnd(code, codelineCallback, filePath)

        const lines = res.split('\n')
        const newLines = lines.map((line) => {
          // console.log(line, filePath)
          const log = getJsFunNameLog(line, filePath)
          return log ? line + log : line
        })

        return newLines.join('\n')
      }

      return code
    },
    transformIndexHtml(html: string) {
      // console.log('transformIdexHtml')

      return html + `<script>${clientJs}</script>`
    },
    // 拦截请求
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url?.includes('/openCode')) {
          const parsedUrl = new URL(req.url, 'http://localhost')
          // console.log(parsedUrl)
          const filePath = parsedUrl.searchParams.get('filePath')
          if (filePath) {
            openCodeFile(filePath) // 执行vscode定位代码行命令
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end()
        } else {
          next()
        }
      })
    },
  }
}

function openCodeFile(path: string) {
  childProcess.exec(`code -r -g ${path}`)
}

function getTemplateStartEnd(code: string, callback: (templateCode: string, filePath: string) => string, filePath: string) {
  return code.replace(/<template>([\s\S]*?)<\/template>/, (match, p1) => {
    return `<template>${callback(p1, filePath)}</template>`
  })
}

function codelineCallback(templateCode: string, filePath: string) {
  const lines = templateCode.split('\n')
  const newLines: string[] = []
  // console.log(templateCode)
  lines.forEach((line, index) => {
    const reg = /<[\w-]+/g
    let newline = line
    if (line.match(reg)) {
      const tagLineList = Array.from(new Set(line.match(reg)))
      tagLineList.forEach((tag) => {
        if (!line.includes('template')) {
          const reg = new RegExp(`${tag}`, 'g')
          // const location = `${tag} location="测试"`
          const location = `${tag} location="${filePath}:${index + 1}"`
          newline = newline.replace(reg, location)
        }
      })
    }
    newLines.push(newline)
  })
  // console.log(newLines.join('\n'))
  return newLines.join('\n')
}
