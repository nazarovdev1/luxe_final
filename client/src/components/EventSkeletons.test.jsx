import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  LiveStreamsSkeleton,
  ChallengesSkeleton,
  EcoImpactSkeleton,
  VIPClubSkeleton,
  LiveStreamViewSkeleton,
  ReelsSkeleton,
  BundleDetailSkeleton,
  ProductViewSkeleton,
  MyGiftCardsSkeleton,
  MobileLiveSkeleton,
} from './EventSkeletons';

describe('EventSkeletons Components', () => {
  it('renders LiveStreamsSkeleton with aria-busy="true"', () => {
    const { container } = render(<LiveStreamsSkeleton />);
    const root = container.querySelector('[aria-busy="true"]');
    expect(root).toBeTruthy();
    expect(root.getAttribute('aria-label')).toBe('Efir kanallari yuklanmoqda');
  });

  it('renders ChallengesSkeleton with aria-busy="true"', () => {
    const { container } = render(<ChallengesSkeleton />);
    const root = container.querySelector('[aria-busy="true"]');
    expect(root).toBeTruthy();
    expect(root.getAttribute('aria-label')).toBe('Tanlovlar yuklanmoqda');
  });

  it('renders EcoImpactSkeleton with aria-busy="true"', () => {
    const { container } = render(<EcoImpactSkeleton />);
    const root = container.querySelector('[aria-busy="true"]');
    expect(root).toBeTruthy();
    expect(root.getAttribute('aria-label')).toBe("Eko-ta'sir tahlil qilinmoqda");
  });

  it('renders VIPClubSkeleton with aria-busy="true"', () => {
    const { container } = render(<VIPClubSkeleton />);
    const root = container.querySelector('[aria-busy="true"]');
    expect(root).toBeTruthy();
    expect(root.getAttribute('aria-label')).toBe("VIP Club ma'lumotlari yuklanmoqda");
  });

  it('renders LiveStreamViewSkeleton with aria-busy="true"', () => {
    const { container } = render(<LiveStreamViewSkeleton />);
    const root = container.querySelector('[aria-busy="true"]');
    expect(root).toBeTruthy();
  });

  it('renders ReelsSkeleton with 9:16 aspect container and action bar icons', () => {
    const { container } = render(<ReelsSkeleton />);
    const frame = container.querySelector('.aspect-\\[9\\/16\\]');
    expect(frame).toBeTruthy();
    expect(container.querySelector('.lucide-heart')).toBeTruthy();
    expect(container.querySelector('.lucide-message-circle')).toBeTruthy();
  });

  it('renders BundleDetailSkeleton with aria-busy="true"', () => {
    const { container } = render(<BundleDetailSkeleton />);
    const root = container.querySelector('[aria-busy="true"]');
    expect(root).toBeTruthy();
  });

  it('renders ProductViewSkeleton with aria-busy="true"', () => {
    const { container } = render(<ProductViewSkeleton />);
    const root = container.querySelector('[aria-busy="true"]');
    expect(root).toBeTruthy();
  });

  it('renders MyGiftCardsSkeleton and MobileLiveSkeleton without errors', () => {
    const { container: c1 } = render(<MyGiftCardsSkeleton />);
    expect(c1.querySelector('[aria-busy="true"]')).toBeTruthy();

    const { container: c2 } = render(<MobileLiveSkeleton />);
    expect(c2.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
});
