import { useMemo } from '../teact/teact';

import type { ApiSticker } from '../api/types';

export default function useThumbnail(media?: ApiSticker) {
  const isMediaContainer = media && 'content' in media;
  const thumbDataUri = media?.thumbnail?.dataUri;

  return thumbDataUri;
}
