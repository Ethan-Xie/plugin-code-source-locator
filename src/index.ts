export default function addCodeLocation() {
  return {
    name: 'vite-plugin-add-code-location',
    enforce: 'pre',
    apply: 'serve',
    transform(code: string, id: string) {
      if (id.endsWith('.vue')) {
        const filePath = id.substring(__dirname.search('build'))
        const res = getTemplateStartEnd(code, codelineCallback, filePath)

        const lines = res.split('\n')
        const newLines = lines.map((line, index) => {
          // console.log(line, filePath)
          const log = getJsFunNameLog(line, filePath)
          return log ? line + log : line
        })

        return newLines.join('\n')
      }

      return code
    },
  }
}

function getTemplateStartEnd(code: string, callback: Function, filePath: string) {
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

/**
 * 通过正则匹配输出：含有函数名的console.log
 * @param lineCode 当前行代码
 * @param path 文件路径
 * @returns string 含有log的代码行，非function的代码行返回空字符串
 */
function getJsFunNameLog(lineCode: string, path: string) {
  // 忽略的文件名
  const isIgnoreName = [
    'CommonMethod.js', // 公共方法
  ].some((lineCode) => path.includes(lineCode))

  // 常见的function 写法
  const commonFunReg = /^\s*(function|async.*function|export.*function)(\s+)(\S+)/
  // 其他写法：形如var xxx = function(){
  // beforeFormSave: function () {
  const otherReg = /(\S+)(\s+)function(\s*)(\S+)/

  let match: string | undefined
  const includeStr = ['{']
  const excludeStr = ['//', '({']
  if (
    !isIgnoreName &&
    includeStr.every((item) => lineCode.includes(item)) &&
    excludeStr.every((item) => !lineCode.includes(item))
  ) {
    if (
      commonFunReg.test(lineCode) &&
      lineCode.includes('(') &&
      lineCode.includes(')') &&
      !lineCode.includes(': {')
    ) {
      match = commonFunReg.exec(lineCode)?.[3]
    } else if (otherReg.test(lineCode) && !lineCode.includes('}') && !path.includes('.ts')) {
      match = otherReg.exec(lineCode)?.input
    }
  }

  let newLine = ''
  if (match) {
    const fileName = path.substring(path.lastIndexOf('/') + 1)

    // 删除干扰文字
    const delArr = [/:\sfunction\s\(\s*\)\s{/, '{', 'var', 'function', /\(\) {/]
    delArr.forEach((element) => {
      match = match?.replace(element, '')
    })
    const consoleText = `${fileName} [执行] ${match.trim()}`.trim()

    newLine =
      ';if(window.jsDebug===true){ console.log(`%c ' +
      consoleText +
      '` +"\t距上个函数"+(window._newTime=(performance.now()-window.startTime).toFixed(1),window._newTime<5000 ? window._newTime : "-")' +
      ' + "ms", "color:green;"),window.startTime = performance.now()};'
  }
  return newLine
}
