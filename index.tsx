import './animated_sticker/src/util/handleError';
import './index.scss'
import './src/styles/Slider.scss';

// Ensure process.env exists
if (typeof process === 'undefined' || !process.env) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}

import React from './animated_sticker/src/teact/teact';
import TeactDOM from './animated_sticker/src/teact/teact-dom';
import { memo, useRef, useState, useEffect } from './animated_sticker/src/teact/teact';
import StickerView from './animated_sticker/src/StickerView';
import StickerSet from './animated_sticker/src/StickerSet';

import './animated_sticker/src/styles/index.scss';

// Set compatibility test to true
(window as any).isCompatTestPassed = true;

interface StickerSet {
  name: string;
  title: string;
  stickers: Array<{
    customEmojiId: string;
    filePath: string;
    thumbnail: {
      dataUri: string
    };
    isLottie?: boolean
  }>;
}

const StickerItem = memo(({ sticker, baseUrl }: { sticker: StickerSet['stickers'][0], baseUrl: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="sticker-cell"
      ref={ref}
      style={{
        transform: 'translateZ(0)', // Hardware acceleration
      }}
    >
      <StickerView
        containerRef={ref}
        size={48}
        noPlay={false}
        shouldLoop={true}
        fps={60} // Reduce FPS for better performance
        quality="medium"
        fullMediaHash={`${baseUrl}/download/${sticker.filePath}`}
        sticker={{
          ...sticker,
          isLottie: sticker.filePath.includes('.tgs'),
          thumbnailPath: `${baseUrl}/download/${sticker.thumbnailPath}`
        }}
      />
    </div>
  );
});

const AutoStatusApp = memo(() => {
  const [stickerSets, setStickerSets] = useState<StickerSet[]>([]);
  const [duration, setDuration] = useState(480); // 8 hours in minutes
  const userImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Signal that the app is ready
    window.Telegram.WebApp.ready();

    // Get initData from Telegram WebApp
    const initData = window.Telegram.WebApp.initData || '';

    // Fetch sticker sets
    console.log("fetching sticker sets");
    fetch('https://autostatus.nashruz.uz/app/stickers', {
      headers: {
        'initData': `${initData}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          const processedData = data.map(set => ({
            ...set,
            stickers: set.stickers.map(sticker => ({
              ...sticker,
              id: sticker.customEmojiId,
              isLottie: sticker.filePath.includes('.tgs'),
              filePath: `${baseUrl}/download/${sticker.filePath}`,
              thumbnail: {
                dataUri: `${baseUrl}/download/${sticker.thumbnailPath}`
              },
              isCustomEmoji: true,
              shouldUseTextColor: false,
              isVideo: false
            }))
          }));
          setStickerSets(processedData);
        } else if (data.result && Array.isArray(data.result)) {
          const processedData = data.result.map(set => ({
            ...set,
            stickers: set.stickers.map(sticker => ({
              ...sticker,
              id: sticker.customEmojiId,
              isLottie: sticker.filePath.includes('.tgs'),
              filePath: `${baseUrl}/download/${sticker.filePath}`,
              thumbnail: {
                dataUri: `${baseUrl}/download/${sticker.thumbnailPath}`
              },
              isCustomEmoji: true,
              shouldUseTextColor: false,
              isVideo: false
            }))
          }));
          setStickerSets(processedData);
        } else {
          console.error('Unexpected data format:', data);
          setStickerSets([]);
        }
      })
      .catch(error => console.error('Error fetching sticker sets:', error));
  }, []);

  const baseUrl = 'https://autostatus.nashruz.uz/app';

  const renderStickers = () => {
    if (!Array.isArray(stickerSets) || stickerSets.length === 0) {
      return null;
    }

    return (
      <div>
        {
          stickerSets.map((set, index) => (
            <StickerSet
              stickerSet={{
                id: set.name,
                accessHash: set.name,
                title: set.title,
                count: set.stickers.length,
                stickers: set.stickers,
                isEmoji: true,
                installedDate: Date.now(),
                isArchived: false,
                hasThumbnail: false,
                hasStaticThumb: false,
                hasAnimatedThumb: false,
                hasVideoThumb: false,
                thumbCustomEmojiId: undefined,
                shortName: "autostatus_stickers",
                isDefaultStatuses: false,
                isDefaultTopicIcons: false,
                isDefaultReactions: false,
                areReactionsUnread: false,
                covers: [],
                packs: [],
                stickerType: 2,
                isAllowed: true
              }}
              isCurrentUserPremium={true}
              loadAndPlay={true}
              index={1}
              idPrefix='12121'
              isNearActive={true}
            />
          ))
        }
      </div>
    );
  };

  return (
    <div className="container" style={{ width: '100%' }}>
      <div className="user-image-container" style={{
        background: 'var(--tg-theme-bg-color)',
        padding: '16px 20px',
        borderRadius: '12px',
        margin: '8px auto',
        width: '90%',
        maxWidth: '400px'
      }}>
        <div className="user-image" ref={userImageRef} style={{
          backgroundImage: `url(${baseUrl}/download/thumbnails/image.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          margin: '0 auto',
          position: 'relative',
          overflow: 'visible'
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--tg-theme-bg-color)'
          }}>
            {stickerSets[0]?.stickers[0] && (
              <StickerView
                sticker={stickerSets[0].stickers[0]}
                size={40}
                noPlay={false}
                isSmall
              />
            )}
          </div>
        </div>
      </div>
      <div className="duration-slider-container">
        <div className="duration-header">
          <span className="duration-label">Duration</span>
          <span className="duration-value">{Math.floor(duration / 60)} hours</span>
        </div>
        <input
          type="range"
          min="10"
          max="1440"
          step="10"
          className="slider"
          value={duration}
          onChange={(e) => {
            const value = Number(e.target.value);
            setDuration(value);
            // Update the progress bar color
            const percentage = ((value - 10) / (1440 - 10)) * 100;
            e.target.style.setProperty('--slider-percentage', `${percentage}%`);
          }}
          style={{ '--slider-percentage': `${((duration - 10) / (1440 - 10)) * 100}%` } as React.CSSProperties}
        />
      </div>
      <div className="sticker-pack" style={{ width: '100%' }}>
        {renderStickers()}
      </div>
    </div>
  );
});

TeactDOM.render(<AutoStatusApp />, document.getElementById('root'));