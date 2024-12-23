import { addClassRecursively } from '@/utils/dom'

function createSVGElement(tag: string, attributes: any) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (const key in attributes) {
    element.setAttribute(key, attributes[key])
  }
  return element
}

export function createCheckpointSVG() {
  const svg = createSVGElement('svg', {
    viewBox: '0 0 24 24',
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
  })
  svg.innerHTML = `
  <defs>
    <style>
      .cls-1 {
        fill: url(#linear-gradient);
      }
      .cls-2 {
        fill: #ce5959;
      }
      .cls-3 {
        fill: #b24040;
      }
      .cls-4 {
        fill: #6c2e7c;
      }
    </style>
    <linearGradient
      gradientUnits="userSpaceOnUse"
      id="linear-gradient"
      x1="12"
      x2="12"
      y1="15.351"
      y2="23.106"
    >
      <stop offset="0" stop-color="#5d5c66" />
      <stop offset="1" stop-color="#48474f" />
    </linearGradient>
  </defs>
  <g id="Icons">
    <path
      class="cls-1"
      d="M12,24a1,1,0,0,1-1-1V17a1,1,0,0,1,2,0v6A1,1,0,0,1,12,24Z"
    />
    <rect class="cls-2" height="4" rx="2" width="12" x="6" y="1" />
    <rect class="cls-3" height="4" rx="2" width="16" x="4" y="13" />
    <polygon class="cls-3" points="18 13 6 13 8 5 16 5 18 13" />
    <polygon class="cls-2" points="17.25 10 6.75 10 8 5 16 5 17.25 10" />
  </g>
  <g data-name="Layer 4" id="Layer_4">
    <path
      class="cls-4"
      d="M3,15a3,3,0,0,0,3,3h5v5a1,1,0,0,0,2,0V18h5a2.992,2.992,0,0,0,.812-5.874l-1.6-6.389A3,3,0,0,0,16,0H8A3,3,0,0,0,6.785,5.737l-1.6,6.389A3,3,0,0,0,3,15Zm15,1H6a1,1,0,0,1,0-2H18a1,1,0,0,1,0,2ZM7.281,12l1.5-6h6.438l1.5,6ZM8,2h8a1,1,0,0,1,0,2H8A1,1,0,0,1,8,2Z"
    />
  </g>
  `
  addClassRecursively(svg, 'app-pin-ignore')
  return svg
}
