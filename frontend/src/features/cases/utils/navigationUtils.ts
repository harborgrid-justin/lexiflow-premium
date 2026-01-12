export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const getRouteMatterId = (hash: string): string | undefined => {
  return hash.split('/matters/')[1]?.split('?')[0];
};

export const navigateTo = (path: string) => {
  window.location.hash = `#/${path}`;
};
