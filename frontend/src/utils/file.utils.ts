export const resolveImage = (path: string) => {
  return `${import.meta.env.VITE_BACKEND_URI}${
    import.meta.env.VITE_BACKEND_PREFIX ? `/${import.meta.env.VITE_BACKEND_PREFIX}` : ``
  }/file?file=${path}`;
};
