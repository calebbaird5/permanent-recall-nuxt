import type { H3Event } from 'h3';

export function getValidatedIdParam(event: H3Event, resource: string = 'resource') {
  const id = Number(getRouterParam(event, 'id'));
  if (isNaN(id)) throw createError({ statusCode: 400, message: `Invalid ${resource} id` });
  return id;
} 