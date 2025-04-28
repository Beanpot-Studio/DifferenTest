import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ExampleComponent from './ExampleComponent.vue'

describe('ExampleComponent', () => {
  it('renders properly', () => {
    render(ExampleComponent, {
      props: {
        title: 'Test Title',
      },
    })

    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const { emitted } = render(ExampleComponent, {
      props: {
        title: 'Test Title',
      },
    })

    const button = screen.getByRole('button')
    await button.click()

    expect(emitted().click).toBeTruthy()
  })
}) 