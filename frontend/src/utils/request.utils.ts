import { RequestQueryParams } from '../types/app.types';

export const serializeQueryParams = (queryParams: RequestQueryParams): string => {
  return Object.entries(queryParams)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}=${value.join(',')}`;
      return `${key}=${value}`;
    })
    .join('&');
};
