import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import Counter from './Counter.vue'

describe('Counter Component', () => {
  it('renders with initial count of 0', () => {
    render(Counter)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('increments count when increment button is clicked', async () => {
    render(Counter)
    const incrementButton = screen.getByText('Increment')
    
    await fireEvent.click(incrementButton)
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
    
    await fireEvent.click(incrementButton)
    expect(screen.getByText('Count: 2')).toBeInTheDocument()
  })

  it('decrements count when decrement button is clicked', async () => {
    render(Counter)
    const decrementButton = screen.getByText('Decrement')
    
    await fireEvent.click(decrementButton)
    expect(screen.getByText('Count: -1')).toBeInTheDocument()
    
    await fireEvent.click(decrementButton)
    expect(screen.getByText('Count: -2')).toBeInTheDocument()
  })
}) 