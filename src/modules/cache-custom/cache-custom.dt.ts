import type { Cache } from 'cache-manager';

declare global {
  type CacheManager = Cache;
}
