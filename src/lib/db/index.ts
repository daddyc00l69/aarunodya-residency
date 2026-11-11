import { repository } from './repository';

/**
 * Returns the active database repository instance
 */
export function getDb() {
  return repository;
}

export * from './repository';
export * from './seed-data';
