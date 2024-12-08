import type { FC } from './teact/teact';
import React, { memo, useEffect, useRef } from './teact/teact';
import { getActions, getGlobal } from './global';

import type { ApiStickerSet } from './api/types';
import type { ObserveFn } from './hooks/useIntersectionObserver';

import { STICKER_SIZE_PICKER_HEADER } from './config';
import { getStickerMediaHash } from './global/helpers';
import buildClassName from './util/buildClassName';
import { getFirstLetters } from './util/textFormat';
import { IS_WEBM_SUPPORTED } from './util/windowEnvironment';

import useColorFilter from './hooks/stickers/useColorFilter';
import useDynamicColorListener from './hooks/stickers/useDynamicColorListener';
import useCoordsInSharedCanvas from './hooks/useCoordsInSharedCanvas';
import { useIsIntersecting } from './hooks/useIntersectionObserver';
import useMedia from './hooks/useMedia';
import useMediaTransitionDeprecated from './hooks/useMediaTransitionDeprecated';
import useMediaTransition from './hooks/useMediaTransition';

import AnimatedSticker from './AnimatedSticker';

import styles from './StickerSetCover.module.scss';

type OwnProps = {
  stickerSet: ApiStickerSet;
  size?: number;
  noPlay?: boolean;
  forcePlayback?: boolean;
  observeIntersection: ObserveFn;
  sharedCanvasRef?: React.RefObject<HTMLCanvasElement>;
};

const StickerSetCover: FC<OwnProps> = ({
  stickerSet,
  size = STICKER_SIZE_PICKER_HEADER,
  noPlay,
  forcePlayback,
  observeIntersection,
  sharedCanvasRef,
}) => {
  const { loadStickers } = getActions();
  // eslint-disable-next-line no-null/no-null
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    hasThumbnail, hasVideoThumb, hasAnimatedThumb, hasStaticThumb, thumbCustomEmojiId,
  } = stickerSet;

  const hasCustomColor = stickerSet.shouldUseTextColor;
  const customColor = useDynamicColorListener(containerRef, !hasCustomColor);
  const colorFilter = useColorFilter(customColor);

  console.log("hasCustomColor", hasCustomColor)
  console.log("customColor", customColor)

  const isIntersecting = useIsIntersecting(containerRef, observeIntersection);
  const shouldPlay = isIntersecting && !noPlay;

  const hasOnlyStaticThumb = hasStaticThumb && !hasVideoThumb && !hasAnimatedThumb && !thumbCustomEmojiId;

  const shouldFallbackToStatic = hasOnlyStaticThumb || (hasVideoThumb && !IS_WEBM_SUPPORTED && !hasAnimatedThumb);
  const staticHash = shouldFallbackToStatic && getStickerMediaHash(stickerSet.stickers![0], 'preview');
  const staticMediaData = useMedia(staticHash, !isIntersecting);

  const mediaHash = ((hasThumbnail && !shouldFallbackToStatic) || hasAnimatedThumb) && thumbCustomEmojiId;
  const mediaData = useMedia(mediaHash, !isIntersecting);
  const isReady = thumbCustomEmojiId || mediaData || staticMediaData;
  const transitionClassNames = useMediaTransitionDeprecated(isReady);

  const fullMediaRef = useMediaTransition<HTMLElement>(isReady, {
  });


  const coords = useCoordsInSharedCanvas(containerRef, sharedCanvasRef);

  useEffect(() => {
    if (isIntersecting && !stickerSet.stickers?.length) {
      loadStickers({
        stickerSetInfo: stickerSet,
      });
    }
  }, [isIntersecting, loadStickers, stickerSet]);

  return (
    <div ref={containerRef} className={buildClassName(styles.root, 'sticker-set-cover')}>
      {isReady ? (
        hasAnimatedThumb ? (
          <AnimatedSticker
            className={transitionClassNames}
            tgsUrl={mediaData}
            size={size}
            play={shouldPlay}
            sharedCanvas={sharedCanvasRef?.current || undefined}
            sharedCanvasCoords={coords}
            forceAlways={forcePlayback}
            color={customColor}
          />
        ) : (
          <img
            src={mediaData || staticMediaData}
            style={colorFilter}
            className={buildClassName(styles.image, transitionClassNames)}
            alt=""
            draggable={false}
          />
        )
      ) : (
        getFirstLetters(stickerSet.title, 2)
      )}
    </div>
  );
};

export default memo(StickerSetCover);
