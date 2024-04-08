import { ArrayContains } from 'typeorm';

const isPrimitiveType = (value: unknown): boolean => {
  return value !== Object(value);
};

export const formatQueryOptions = (options: any) => {
  return Object.entries(options).reduce((previousValue, [key, value]) => {
    if (Array.isArray(value)) previousValue[key] = ArrayContains(value);
    else if (!isPrimitiveType(value)) previousValue[key] = formatQueryOptions(value);
    else previousValue[key] = value;

    return previousValue;
  }, {} as any);
};
