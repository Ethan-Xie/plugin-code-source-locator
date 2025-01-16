import { Plugin } from 'vite'

export default function addCodeLocation(): Plugin {
  return {
    name: 'vite-plugin-add-code-location',
    enforce: 'pre',
    apply: 'serve',
    transform(code: string, id: string) {
      if (id.endsWith('.vue')) {
        const filePath = id.substring(__dirname.search('build'))
        const res = getTemplateStartEnd(code, codelineCallback, filePath)

        return res

        // const filePath = id.substring(__dirname.substring() + 1);
        // const lines = code.split('\n')
        // const newLines = lines.map((line, index) => {
        //     const lineNumber = index + 1;
        //     return `// ${lineNumber}: ${line}`;
        // });
        // return newLines.join('\n')
      }

      return code
    },
  }
}

function getTemplateStartEnd(code:string, callback:Function, filePath:string) {
  return code.replace(/<template>([\s\S]*?)<\/template>/, (match, p1) => {
    return `<template>${callback(p1, filePath)}</template>`
  })
}

function codelineCallback(templateCode:string, filePath:string) {
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
