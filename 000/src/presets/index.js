export const presets = {
  cleanshot: {
    name: 'CleanShot',
    description: 'Privacy-focused metadata removal',
    config: {
      appName: 'CleanShot',
      headline: 'Strip Metadata Instantly',
      subheadline: 'Protect your privacy with one tap',
      benefits: [
        'Remove EXIF data from photos & videos',
        'Batch process multiple files at once',
        'Keep originals safe, export clean copies'
      ],
      ctaText: 'Protect Your Privacy',
      colors: {
        primary: '#14B8A6',
        secondary: '#0D9488',
        background: '#F0FDFA',
        text: '#134E4A'
      },
      platform: 'ios-6.7'
    },
    elements: [
      { id: 'app-name', type: 'text', text: 'CleanShot', x: 0.5, y: 0.08, size: 0.04, color: '#14B8A6', bold: true, align: 'center' },
      { id: 'headline', type: 'text', text: 'Strip Metadata Instantly', x: 0.5, y: 0.14, size: 0.05, color: '#134E4A', bold: true, align: 'center' },
      { id: 'subheadline', type: 'text', text: 'Protect your privacy with one tap', x: 0.5, y: 0.20, size: 0.028, color: '#64748B', bold: false, align: 'center' },
      { id: 'screenshot', type: 'screenshot', x: 0.5, y: 0.48, width: 0.7, height: 0.4 },
      { id: 'benefit-1', type: 'text', text: '✓ Remove EXIF data from photos & videos', x: 0.5, y: 0.74, size: 0.022, color: '#134E4A', align: 'center' },
      { id: 'benefit-2', type: 'text', text: '✓ Batch process multiple files at once', x: 0.5, y: 0.78, size: 0.022, color: '#134E4A', align: 'center' },
      { id: 'benefit-3', type: 'text', text: '✓ Keep originals safe, export clean copies', x: 0.5, y: 0.82, size: 0.022, color: '#134E4A', align: 'center' },
      { id: 'social-proof', type: 'text', text: 'Trusted by privacy-conscious creators', x: 0.5, y: 0.89, size: 0.02, color: '#14B8A6', align: 'center' },
      { id: 'cta', type: 'button', text: 'Protect Your Privacy', x: 0.5, y: 0.94, width: 0.65, height: 0.055 }
    ]
  },
  
  productivity: {
    name: 'Productivity App',
    description: 'Focus on efficiency and time-saving',
    config: {
      appName: 'TaskMaster Pro',
      headline: 'Get More Done, Stress Less',
      subheadline: 'Your personal productivity powerhouse',
      benefits: [
        'Save 2+ hours every day',
        'Never miss a deadline',
        'AI-powered task prioritization'
      ],
      ctaText: 'Start Free Trial',
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        background: '#F8FAFC',
        text: '#1F2937'
      },
      platform: 'ios-6.7'
    },
    elements: [
      { id: 'app-name', type: 'text', text: 'TaskMaster Pro', x: 0.5, y: 0.08, size: 0.04, color: '#6366F1', bold: true, align: 'center' },
      { id: 'headline', type: 'text', text: 'Get More Done, Stress Less', x: 0.5, y: 0.14, size: 0.045, color: '#1F2937', bold: true, align: 'center' },
      { id: 'subheadline', type: 'text', text: 'Your personal productivity powerhouse', x: 0.5, y: 0.20, size: 0.025, color: '#6B7280', align: 'center' },
      { id: 'screenshot', type: 'screenshot', x: 0.5, y: 0.48, width: 0.75, height: 0.42 },
      { id: 'benefit-1', type: 'text', text: '⚡ Save 2+ hours every day', x: 0.5, y: 0.74, size: 0.022, color: '#1F2937', align: 'center' },
      { id: 'benefit-2', type: 'text', text: '🎯 Never miss a deadline', x: 0.5, y: 0.78, size: 0.022, color: '#1F2937', align: 'center' },
      { id: 'benefit-3', type: 'text', text: '🤖 AI-powered task prioritization', x: 0.5, y: 0.82, size: 0.022, color: '#1F2937', align: 'center' },
      { id: 'cta', type: 'button', text: 'Start Free Trial', x: 0.5, y: 0.92, width: 0.6, height: 0.055 }
    ]
  },

  fitness: {
    name: 'Fitness Tracker',
    description: 'Health and wellness focused',
    config: {
      appName: 'FitLife',
      headline: 'Transform Your Body',
      subheadline: 'Personalized workouts that adapt to you',
      benefits: [
        'Custom workout plans',
        'Track progress with AI',
        'Join 1M+ active users'
      ],
      ctaText: 'Start Your Journey',
      colors: {
        primary: '#EF4444',
        secondary: '#F97316',
        background: '#FEF2F2',
        text: '#991B1B'
      },
      platform: 'ios-6.7'
    },
    elements: [
      { id: 'app-name', type: 'text', text: 'FitLife', x: 0.5, y: 0.08, size: 0.04, color: '#EF4444', bold: true, align: 'center' },
      { id: 'headline', type: 'text', text: 'Transform Your Body', x: 0.5, y: 0.14, size: 0.05, color: '#991B1B', bold: true, align: 'center' },
      { id: 'subheadline', type: 'text', text: 'Personalized workouts that adapt to you', x: 0.5, y: 0.20, size: 0.026, color: '#DC2626', align: 'center' },
      { id: 'screenshot', type: 'screenshot', x: 0.5, y: 0.48, width: 0.7, height: 0.4 },
      { id: 'benefit-1', type: 'text', text: '💪 Custom workout plans', x: 0.5, y: 0.74, size: 0.022, color: '#991B1B', align: 'center' },
      { id: 'benefit-2', type: 'text', text: '📊 Track progress with AI', x: 0.5, y: 0.78, size: 0.022, color: '#991B1B', align: 'center' },
      { id: 'benefit-3', type: 'text', text: '👥 Join 1M+ active users', x: 0.5, y: 0.82, size: 0.022, color: '#991B1B', align: 'center' },
      { id: 'cta', type: 'button', text: 'Start Your Journey', x: 0.5, y: 0.92, width: 0.65, height: 0.055 }
    ]
  }
};