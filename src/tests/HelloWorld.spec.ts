import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import HelloWorldVue from '@/components/HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorldVue, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
