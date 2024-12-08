export enum ApiMediaFormat {
  BlobUrl = 'blobUrl',
  Text = 'text',
  Raw = 'raw',
}

export interface ApiDimensions {
  width: number;
  height: number;
}

export interface ApiThumbnail extends ApiDimensions {
  dataUri: string;
}

export interface ApiSticker {
  mediaType: 'sticker';
  id: string;
  customEmojiId: string,
  emoji?: string;
  isCustomEmoji?: boolean;
  isLottie: boolean;
  isVideo: boolean;
  width?: number;
  height?: number;
  thumbnail?: ApiThumbnail;
  isPreloadedGlobally?: boolean;
  hasEffect?: boolean;
  isFree?: boolean;
  shouldUseTextColor?: boolean;
}

export interface ApiStickerSet {
  isArchived?: true;
  isEmoji?: true;
  installedDate?: number;
  id: string;
  accessHash: string;
  title: string;
  hasThumbnail?: boolean;
  hasStaticThumb?: boolean;
  hasAnimatedThumb?: boolean;
  hasVideoThumb?: boolean;
  thumbCustomEmojiId?: string;
  count: number;
  stickers?: ApiSticker[];
  packs?: Record<string, ApiSticker[]>;
  covers?: ApiSticker[];
  shortName: string;
  shouldUseTextColor?: boolean;
}