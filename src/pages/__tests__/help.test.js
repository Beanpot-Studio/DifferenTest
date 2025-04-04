import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HelpPage from '../help.astro';
import MainLayout from '../../../layouts/MainLayout.astro';
import HelpCenter from '../../../components/HelpCenter.vue';

// Mock components
vi.mock('../../../layouts/MainLayout.astro', () => ({
  default: {
    render: () => 'MainLayout'
  }
}));

vi.mock('../../../components/HelpCenter.vue', () => ({
  default: {
    render: () => 'HelpCenter'
  }
}));

describe('Help Page', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(HelpPage, {
      global: {
        mocks: {
          $route: {
            path: '/help'
          }
        }
      }
    });
  });

  it('renders MainLayout component', () => {
    const mainLayout = wrapper.findComponent(MainLayout);
    expect(mainLayout.exists()).toBe(true);
  });

  it('renders HelpCenter component', () => {
    const helpCenter = wrapper.findComponent(HelpCenter);
    expect(helpCenter.exists()).toBe(true);
  });

  it('has correct title', () => {
    const title = wrapper.find('h1');
    expect(title.text()).toBe('Help Center');
  });

  it('has correct back link', () => {
    const backLink = wrapper.find('a');
    expect(backLink.attributes('href')).toBe('/');
    expect(backLink.text()).toBe('Back to Home');
  });

  it('has correct client:load attribute on HelpCenter', () => {
    const helpCenter = wrapper.findComponent(HelpCenter);
    expect(helpCenter.attributes('client:load')).toBe('true');
  });

  it('has correct styling classes', () => {
    const container = wrapper.find('.max-w-4xl');
    expect(container.exists()).toBe(true);

    const contentContainer = wrapper.find('.bg-white.rounded-lg.shadow-md');
    expect(contentContainer.exists()).toBe(true);
  });

  it('has correct page structure', () => {
    const mainLayout = wrapper.findComponent(MainLayout);
    const helpCenter = wrapper.findComponent(HelpCenter);

    expect(mainLayout.find('.max-w-4xl').exists()).toBe(true);
    expect(helpCenter.parent().classes()).toContain('bg-white');
    expect(helpCenter.parent().classes()).toContain('rounded-lg');
    expect(helpCenter.parent().classes()).toContain('shadow-md');
  });
}); 