import { UNIQUE_CODE } from '@/common/constant'
import { createCheckpointSVG } from '@/common/createSVG'
import { DOMitem } from '@/common/types/report'

class DOMPin {
  activateHighlighter() {
    document.addEventListener('mouseover', this.handleMouseOver)
    document.addEventListener('mouseout', this.handleMouseOut)
  }

  deactivateHighlighter() {
    document.removeEventListener('mouseover', this.handleMouseOver)
    document.removeEventListener('mouseout', this.handleMouseOut)
  }

  ignore(e) {
    return e.target.classList.contains('app-pin-ignore')
  }

  handleMouseOver = (e) => {
    if (this.ignore(e)) return
    e.target.style.outline = '2px solid red'
  }

  handleMouseOut = (e) => {
    e.target.style.outline = ''
  }

  handleClick = (e, id: number) => {
    if (this.ignore(e)) return undefined
    e.preventDefault()
    e.stopPropagation()
    const domPath = this.getDomPath(e.target)
    this.addCheckpoint(e.target, id)
    return domPath
  }

  addCheckpoint(element: Element, id: number, message?: string) {
    const checkpoint = document.createElement('div')
    checkpoint.id = `app-checkpoint-${UNIQUE_CODE}-${id}`
    const svg = createCheckpointSVG()
    checkpoint.appendChild(svg)
    checkpoint.style.position = 'absolute'
    checkpoint.style.width = '36px'
    checkpoint.style.height = '36px'
    checkpoint.style.top = '0'
    checkpoint.style.left = '0'
    checkpoint.style.transform = 'translate(-100%, -50%) rotate(315deg)'
    checkpoint.style.zIndex = '9998'
    checkpoint.classList.add('app-pin-ignore')

    const checkpointMessage = document.createElement('div')
    checkpointMessage.id = `app-checkpoint-message-${UNIQUE_CODE}-${id}`
    checkpointMessage.classList.add('app-pin-ignore')
    if (message) {
      checkpointMessage.textContent = message
      if (!checkpointMessage.classList.contains('padding-apply'))
        checkpointMessage.classList.add('padding-apply')
    }

    // Đặt checkpoint tương đối với element
    const wrapper = document.createElement('div')
    wrapper.id = `app-checkpoint-container-${UNIQUE_CODE}-${id}`
    wrapper.style.position = 'relative'
    wrapper.classList.add('app-pin-ignore')
    wrapper.appendChild(checkpoint)
    wrapper.appendChild(checkpointMessage)
    const style = document.createElement('style')
    style.textContent = `
      #app-checkpoint-${UNIQUE_CODE}-${id} {
        cursor: pointer;
      }
      #app-checkpoint-message-${UNIQUE_CODE}-${id} {
        display: none;
        position: absolute;
        bottom: -100%;
        left: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        font-size: 1rem;
        font-weight: normal;
      }
      #app-checkpoint-${UNIQUE_CODE}-${id}:hover ~ #app-checkpoint-message-${UNIQUE_CODE}-${id} {
        display: block;
      }
      .padding-apply{
        padding: 8px
      }
    `
    wrapper.appendChild(style)
    element.classList.add('app-pin-ignore')
    element.prepend(wrapper)
  }

  getDomPath(element) {
    if (!(element instanceof Element)) return
    const stack = []
    while (
      element.parentNode != null &&
      element.nodeName.toLowerCase() != 'html'
    ) {
      let sibCount = 0
      let sibIndex = 0
      const siblings = element.parentNode.childNodes
      for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i]
        if (sibling.nodeName === element.nodeName) {
          if (sibling === element) {
            sibIndex = sibCount
          }
          sibCount++
        }
      }
      let nodeSelector = element.nodeName.toLowerCase()
      if (element.id) {
        nodeSelector += '#' + element.id
      } else if (element.className && typeof element.className === 'string') {
        nodeSelector += '.' + element.className.trim().replace(/\s+/g, '.')
      } else if (sibCount > 1) {
        nodeSelector += `:nth-of-type(${sibIndex + 1})`
      }

      stack.unshift(nodeSelector)
      element = element.parentNode
    }
    if (element.nodeName.toLowerCase() == 'html') stack.unshift('html')

    return stack.join(' > ')
  }
  getElementByDomPath(domPath: string) {
    try {
      const element = document.querySelector(domPath)
      return element
    } catch (error) {
      console.error('Error finding element for DOM path:', domPath, error)
      return null
    }
  }

  initializeCheckpoints(item: DOMitem[]) {
    item.forEach(({ domPath, domId, message }) => {
      const element = this.getElementByDomPath(domPath)
      if (element) {
        this.addCheckpoint(element, domId, message)
      } else {
        console.warn('Element not found for DOM path:', domPath)
      }
    })
  }
}
export default new DOMPin()
