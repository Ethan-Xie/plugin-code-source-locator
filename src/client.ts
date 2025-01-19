const openCode = (e: MouseEvent) => {
  if (e.altKey) {
    e.preventDefault()
    const filePath = getFilePath(e.target as Element)
    window.console.log(filePath)
    if (filePath) {
      e.stopPropagation()
      openEditor(filePath)
    }
  }
}

const getFilePath = (target: Element) => {
  if (!target || !target.getAttribute) {
    return ''
  }
  const codeLocation = target.getAttribute('location')
  if (codeLocation) {
    return codeLocation
  }

  if (!target.parentNode) {
    return ''
  }
  return getFilePath(target.parentNode as Element)
}

function openEditor(filePath: string) {
  const location = window.location
  fetch(
    `${location.protocol}//${location.host}/openCode?`
    + new URLSearchParams({
      filePath: `${filePath}`,
    }).toString(),
  ).catch((error) => {
    window.console.log(error)
  })
}

document.addEventListener('click', openCode)
