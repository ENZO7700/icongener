// e2e/fixtures/testData.ts
export const TEST_PRESETS = {
  icon: {
    circle: { id: 'circle', name: 'Circle', svg: '<circle cx="50%" cy="50%" r="40%"/>' },
    square: { id: 'square', name: 'Square', svg: '<rect x="10%" y="10%" width="80%" height="80%"/>' },
    rounded: { id: 'rounded', name: 'Rounded Square', svg: '<rect x="10%" y="10%" width="80%" height="80%" rx="10%"/>' }
  },
  favicon: {
    sizes: [16, 32, 64, 128, 256],
    formats: ['ico', 'png']
  },
  banner: {
    presets: {
      facebook: { width: 1200, height: 630, name: 'Facebook Post' },
      twitter: { width: 1200, height: 675, name: 'Twitter Post' },
      instagram: { width: 1080, height: 1080, name: 'Instagram Post' },
      linkedin: { width: 1200, height: 627, name: 'LinkedIn Post' },
      youtube: { width: 1280, height: 720, name: 'YouTube Thumbnail' }
    }
  },
  pngToHtml: {
    simple: {
      name: 'Simple Pixel Art',
      png: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e9hgAAAABJRU5ErkJggg==',
      expectedHtml: '<div style="width:10px;height:10px;background:red;"></div>'
    }
  }
};

export const TEST_USERS = {
  valid: { email: 'test@example.com', password: 'password123' },
  invalid: { email: 'invalid', password: '123' }
};
