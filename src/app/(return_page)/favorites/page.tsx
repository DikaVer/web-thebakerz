import React from 'react';
import { getCurrentFavorites } from '@/lib/actions/favorites';
import { FavoritesProvider } from '@/components/providers/favorites-provider';
import FavoritesContent from '@/components/favorites/favorites-content';
import { getCurrentSession } from '@/lib/actions/session';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Favorites | TheBakerz',
  description: 'Manage your favorite stores and products on TheBakerz. Save your top picks for easy access.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FavoritesPage() {
  const session = await getCurrentSession();
  
  // Redirect to sign in if no user session
  if (!session?.user) {
    redirect('/sign-in');
  }

  // Fetch favorites data
  const initialStoreFavorites = await getCurrentFavorites("getStoreFavorites");
  const initialProductFavorites = await getCurrentFavorites("getProductFavorites");

  return (
    <FavoritesProvider 
      initialStoreFavorites={initialStoreFavorites}
      initialProductFavorites={initialProductFavorites}
    >
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        <FavoritesContent />
      </div>
    </FavoritesProvider>
  );
} 