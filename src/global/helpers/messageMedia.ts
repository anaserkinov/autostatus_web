import type {
    ApiSticker
  } from '../../api/types';

  type Target =
  'micro'
  | 'pictogram'
  | 'inline'
  | 'preview'
  | 'full'
  | 'download';

export function getStickerMediaHash(sticker: ApiSticker, target: Target) {
    const base = `document${sticker.id}`;
  
    switch (target) {
      case 'micro':
      case 'pictogram':
        if (!sticker.previewPhotoSizes?.some((size) => size.type === 's')) {
          return getStickerMediaHash(sticker, 'preview');
        }
        return `${base}?size=s`;
      case 'preview':
        return `${base}?size=m`;
      case 'download':
        return `${base}?download`;
      case 'inline':
      default:
        return base;
    }
  }