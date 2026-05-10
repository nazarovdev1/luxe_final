import { lazy } from 'react';

/**
 * A wrapper around React.lazy that retries the import if it fails due to a ChunkLoadError.
 * This is useful for handling cases where the app is updated and old chunks are no longer available on the server.
 */
export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.localStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // ChunkLoadError usually means the server has been updated and the old chunk is gone
        // or there was a temporary network error.
        window.localStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return;
      }

      // If we already tried to refresh and it still fails, throw the error
      throw error;
    }
  });
