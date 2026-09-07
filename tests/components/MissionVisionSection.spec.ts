// @vitest-environment jsdom

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MissionVisionSection from '../../app/components/about/MissionVisionSection.vue';

describe('MissionVisionSection', () => {
  it('uses responsive concept scenes for Vision and Mission', () => {
    const wrapper = mount(MissionVisionSection);
    const images = wrapper.findAll('img');
    const figures = wrapper.findAll('figure');

    expect(images.map((image) => image.attributes('src'))).toEqual([
      '/images/about/vision-modular-campus-v2.png',
      '/images/about/mission-community-campus-v2.png',
    ]);
    expect(images[0]?.attributes('srcset')).toBe('/images/about/vision-modular-campus-v2.webp 1280w');
    expect(images[0]?.attributes('alt')).toBe('Concept visualisation of a landscaped modular business campus');
    expect(images[1]?.attributes('srcset')).toBe('/images/about/mission-community-campus-v2.webp 1280w');
    expect(images[1]?.attributes('alt')).toBe('Concept visualisation of a modular community campus with support cabins');
    expect(images.map((image) => image.attributes('sizes'))).toEqual([
      '(min-width: 768px) 50vw, 100vw',
      '(min-width: 768px) 50vw, 100vw',
    ]);
    expect(wrapper.find('figcaption').exists()).toBe(false);

    for (const figure of figures) {
      expect(figure.classes()).toContain('aspect-[23/10]');
    }

    for (const image of images) {
      expect(image.attributes('loading')).toBe('lazy');
      expect(image.attributes('decoding')).toBe('async');
      expect(image.classes()).toEqual(expect.arrayContaining([
        'h-full',
        'w-full',
        'object-cover',
      ]));
      expect(image.classes()).not.toContain('group-hover:scale-105');
    }
  });

  it('references image assets that exist in public', () => {
    for (const filename of [
      'vision-modular-campus-v2.png',
      'vision-modular-campus-v2.webp',
      'mission-community-campus-v2.png',
      'mission-community-campus-v2.webp',
    ]) {
      expect(existsSync(resolve(process.cwd(), 'public/images/about', filename))).toBe(true);
    }
  });
});
