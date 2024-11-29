export enum ApiMediaFormat {
  BlobUrl = 'blobUrl',
  Text = 'text',
  Raw = 'raw',
}

export interface ApiSticker {
  id: string;
  isCustomEmoji?: boolean;
  isLottie?: boolean;
  isVideo?: boolean;
  width?: number;
  height?: number;
  thumbnail?: {
    dataUri?: string;
    width: number;
    height: number;
  };
  stickerSetInfo?: {
    shortName: string;
  };
}
