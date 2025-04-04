import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TeacherDashboard from '../teacher/index.astro';
import RoleBasedContent from '../../../components/RoleBasedContent.vue';

// Mock RoleBasedContent component
vi.mock('../../../components/RoleBasedContent.vue', () => ({
  default: {
    render: () => 'RoleBasedContent'
  }
}));

describe('Teacher Dashboard', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(TeacherDashboard, {
      global: {
        mocks: {
          $route: {
            path: '/teacher'
          }
        }
      }
    });
  });

  it('renders the correct title', () => {
    const title = wrapper.find('h1');
    expect(title.text()).toBe('Teacher Portal');
  });

  it('renders RoleBasedContent component', () => {
    const roleBasedContent = wrapper.findComponent(RoleBasedContent);
    expect(roleBasedContent.exists()).toBe(true);
  });

  it('contains all navigation cards', () => {
    const cards = wrapper.findAll('.bg-white.rounded-lg.shadow-md');
    expect(cards.length).toBe(4); // Quiz Management, Class Management, Student Submissions, Help Center

    const cardTitles = cards.map(card => card.find('h2').text());
    expect(cardTitles).toEqual([
      'Quiz Management',
      'Class Management',
      'Student Submissions',
      'Help Center'
    ]);
  });

  it('has correct links for each card', () => {
    const links = wrapper.findAll('a');
    expect(links.length).toBe(4);

    const linkHrefs = links.map(link => link.attributes('href'));
    expect(linkHrefs).toEqual([
      '/teacher/quizzes',
      '/teacher/classes',
      '/teacher/submissions',
      '/help'
    ]);
  });

  it('displays correct descriptions for each card', () => {
    const cards = wrapper.findAll('.bg-white.rounded-lg.shadow-md');
    const descriptions = cards.map(card => card.find('p').text());

    expect(descriptions).toEqual([
      'Create and manage your quizzes',
      'Manage your classes and students',
      'View and track student progress',
      'Get help and support'
    ]);
  });

  it('has correct client:only attribute on RoleBasedContent', () => {
    const roleBasedContent = wrapper.findComponent(RoleBasedContent);
    expect(roleBasedContent.attributes('client:only')).toBe('true');
  });

  it('has correct requiredRoles prop on RoleBasedContent', () => {
    const roleBasedContent = wrapper.findComponent(RoleBasedContent);
    expect(roleBasedContent.props('requiredRoles')).toEqual(['teacher']);
  });
}); 