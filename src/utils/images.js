// Reliable image URLs - picsum.photos provides consistent, working images per seed
export const getPosterUrl = (id) =>
  `https://picsum.photos/seed/poster${id}/400/600`;

export const getBackdropUrl = (id) =>
  `https://picsum.photos/seed/backdrop${id}/1280/720`;
