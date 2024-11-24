export const addClassRecursively = (
  element: Element | null,
  className: string,
): void => {
  if (!element) return
  if (!element.classList.contains(className)) element.classList.add(className)

  Array.from(element.children).forEach((child) => {
    if (child instanceof Element) {
      addClassRecursively(child, className)
    }
  })
}
