export const clickOutsideDirective = {
  beforeMount(element, binding) {
    element.clickOutsideEvent = function (event) {
      if (!(element === event.target || element.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', element.clickOutsideEvent, true)
  },
  unmounted(element) {
    document.removeEventListener('click', element.clickOutsideEvent, true)
  },
}
