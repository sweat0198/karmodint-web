// @vitest-environment jsdom

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AboutHeroSection from '../../app/components/about/HeroSection.vue';

describe('AboutHeroSection', () => {
  it('presents the Old Trafford kiosk installation with responsive images', () => {
    const wrapper = mount(AboutHeroSection);
    const image = wrapper.get('img');
    const webpSource = wrapper.get('picture source[type="image/webp"]');

    expect(image.attributes('src')).toBe('/images/about/about-old-trafford-kiosks.jpg');
    expect(image.attributes('srcset')).toBeUndefined();
    expect(webpSource.attributes('srcset')).toBe('/images/about/about-old-trafford-kiosks-640.webp 640w, /images/about/about-old-trafford-kiosks-1280.webp 1280w');
    expect(webpSource.attributes('sizes')).toBe('(min-width: 1024px) 560px, calc(100vw - 48px)');
    expect(image.attributes('alt')).toBe('Two black Manchester United programme kiosks under the stadium concourse canopy at Old Trafford, behind red crowd barriers.');
    expect(image.attributes('width')).toBe('1280');
    expect(image.attributes('height')).toBe('960');
    expect(image.attributes('loading')).toBe('eager');
    expect(image.attributes('fetchpriority')).toBe('high');
    expect(image.attributes('decoding')).toBe('async');
    expect(image.classes()).toEqual(expect.arrayContaining(['h-full', 'w-full', 'object-cover']));
    expect(image.classes()).not.toContain('group-hover:scale-105');
    expect(wrapper.find('figcaption').exists()).toBe(false);
  });

  it('references hero assets that exist in public', () => {
    for (const filename of [
      'about-old-trafford-kiosks.jpg',
      'about-old-trafford-kiosks-640.webp',
      'about-old-trafford-kiosks-1280.webp',
    ]) {
      expect(existsSync(resolve(process.cwd(), 'public/images/about', filename))).toBe(true);
    }
  });
});
