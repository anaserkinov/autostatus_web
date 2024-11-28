import type { FC } from '../src/teact/teact';
import React, { memo, useMemo, useRef } from '../src/teact/teact';

import type { ApiSticker } from '../src/api/types';
import buildClassName from './util/buildClassName';
import useUniqueId from './hooks/useUniqueId';
import useMediaTransition from './hooks/useMediaTransition';
import useThumbnail from './hooks/useThumbnail';
import useCoordsInSharedCanvas from './hooks/useCoordsInSharedCanvas';
import useMedia from './hooks/useMedia';
import * as mediaLoader from './util/mediaLoader';
import useColorFilter from './hooks/stickers/useColorFilter';
import useFlag from './hooks/useFlag';
import useDevicePixelRatio from './hooks/window/useDevicePixelRatio';
import { getStickerMediaHash } from './global/helpers';

import AnimatedSticker from './AnimatedSticker';

import styles from './StickerView.module.scss';

type OwnProps = {
  containerRef: React.RefObject<HTMLDivElement>;
  sticker: ApiSticker;
  thumbClassName?: string;
  fullMediaHash?: string;
  fullMediaClassName?: string;
  isSmall?: boolean;
  size?: number;
  customColor?: string;
  loopLimit?: number;
  shouldLoop?: boolean;
  shouldPreloadPreview?: boolean;
  forceAlways?: boolean;
  forceOnHeavyAnimation?: boolean;
  noLoad?: boolean;
  noPlay?: boolean;
  noVideoOnMobile?: boolean;
  withSharedAnimation?: boolean;
  sharedCanvasRef?: React.RefObject<HTMLCanvasElement>;
  withTranslucentThumb?: boolean; // With shared canvas thumbs are opaque by default to provide better transition effect
  onVideoEnded?: AnyToVoidFunction;
  onAnimatedStickerLoop?: AnyToVoidFunction;
};

const SHARED_PREFIX = 'shared';
const STICKER_SIZE = 24;

const StickerView: FC<OwnProps> = ({
  containerRef,
  sticker,
  thumbClassName,
  fullMediaHash,
  fullMediaClassName,
  isSmall,
  size = STICKER_SIZE,
  customColor,
  loopLimit,
  shouldLoop = false,
  shouldPreloadPreview,
  forceAlways,
  forceOnHeavyAnimation,
  noLoad,
  noPlay,
  noVideoOnMobile,
  withSharedAnimation,
  withTranslucentThumb,
  sharedCanvasRef,
  onVideoEnded,
  onAnimatedStickerLoop,
}) => {
  const {
    id, isLottie, stickerSetInfo, emoji,
  } = sticker;

  const isVideo = sticker.isVideo;
  const isStatic = !isLottie && !isVideo;
  const previewMediaHash = getStickerMediaHash(sticker, 'preview');

  const dpr = useDevicePixelRatio();

  const filterStyle = useColorFilter(customColor);

  const shouldPlay = !noPlay;
  const shouldLoad =  !noLoad;


  const cachedPreview = mediaLoader.getFromMemory(previewMediaHash);
  const shouldForcePreview =  (isStatic ? isSmall : noPlay);
  const shouldLoadPreview = !customColor && !cachedPreview && (shouldForcePreview);
  const previewMediaData = useMedia(previewMediaHash, !shouldLoadPreview);
  const withPreview = shouldLoadPreview || cachedPreview;

  const shouldSkipFullMedia = Boolean(shouldForcePreview || (
    fullMediaHash === previewMediaHash && (cachedPreview || previewMediaData)
  ));
  const fullMediaData = useMedia(fullMediaHash || `sticker${id}`, !shouldLoad || shouldSkipFullMedia);
  const shouldRenderFullMedia = !shouldSkipFullMedia && fullMediaData;
  const [isPlayerReady, markPlayerReady] = useFlag();
  const isFullMediaReady = shouldRenderFullMedia && (isStatic || isPlayerReady);

  const thumbDataUri = useThumbnail(sticker);
  const thumbData = cachedPreview || previewMediaData || thumbDataUri;
  const isThumbOpaque = sharedCanvasRef && !withTranslucentThumb;

  const noCrossTransition = Boolean(isLottie && withPreview);
  const thumbRef = useMediaTransition<HTMLImageElement>(thumbData && !isFullMediaReady, {
    noCloseTransition: noCrossTransition,
  });
  const fullMediaRef = useMediaTransition<HTMLElement>(isFullMediaReady, {
    noOpenTransition: noCrossTransition,
  });

  const coords = useCoordsInSharedCanvas(containerRef, sharedCanvasRef);

  const randomIdPrefix = useUniqueId();
  const renderId = useMemo(() => ([
    (withSharedAnimation ? SHARED_PREFIX : randomIdPrefix),
    id,
    size,
    (withSharedAnimation ? customColor : undefined),
    dpr,
  ].filter(Boolean).join('_')), [customColor, dpr, id, randomIdPrefix, size, withSharedAnimation]);

  return (
    <>
      <img
        ref={thumbRef}
        src={thumbData}
        className={buildClassName(
          styles.thumb,
          noCrossTransition && styles.noTransition,
          isThumbOpaque && styles.thumbOpaque,
          thumbClassName,
          'sticker-media',
        )}
        style={filterStyle}
        alt=""
        draggable={false}
      />
      {shouldRenderFullMedia && (isLottie ? (
        <AnimatedSticker
          ref={fullMediaRef as React.RefObject<HTMLDivElement>}
          key={renderId}
          renderId={renderId}
          size={size}
          className={buildClassName(
            styles.media,
            (noCrossTransition || isThumbOpaque) && styles.noTransition,
            fullMediaClassName,
          )}
          tgsUrl={fullMediaData}
          play={shouldPlay}
          noLoop={!shouldLoop}
          forceOnHeavyAnimation={forceAlways || forceOnHeavyAnimation}
          forceAlways={forceAlways}
          isLowPriority={isSmall}
          sharedCanvas={sharedCanvasRef?.current || undefined}
          sharedCanvasCoords={coords}
          onLoad={markPlayerReady}
          onLoop={onAnimatedStickerLoop}
          onEnded={onAnimatedStickerLoop}
          color={customColor}
        />
      ) : (
        <img
          ref={fullMediaRef as React.RefObject<HTMLImageElement>}
          className={buildClassName(styles.media, fullMediaClassName, 'sticker-media')}
          src={fullMediaData}
          alt={emoji}
          style={filterStyle}
          draggable={false}
        />
      ))}
    </>
  );
};

export default memo(StickerView);
