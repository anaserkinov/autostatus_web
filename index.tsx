import './src/util/handleError';

// Ensure process.env exists
if (typeof process === 'undefined' || !process.env) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}

import React from './src/teact/teact';
import TeactDOM from './src/teact/teact-dom';
import { getGlobal, setGlobal } from './src/global';
import { memo, useRef, useState, useEffect } from './src/teact/teact';
import StickerView from './src/StickerView';
import StickerSet from './src/StickerSet';
import CustomEmojiPicker from './src/CustomEmojiPicker'
import useScrolledState from './src/hooks/useScrolledState';
import buildClassName from './src/util/buildClassName';
import { ApiSticker, ApiStickerSet } from './src/api/types'
import useLastCallback from './src/hooks/useLastCallback';

import { IS_TOUCH_ENV } from './src/util/windowEnvironment';

import './src/styles/index.scss';
import sliderStyle from './Slider.module.scss';


// Set compatibility test to true
(window as any).isCompatTestPassed = true;

const AutoStatusApp = memo(() => {
  const [stickerSets, setStickerSets] = useState<ApiStickerSet[]>([]);
  const [duration, setDuration] = useState(480); // 8 hours in minutes
  const userImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.Telegram.WebApp.ready();

    const initData = window.Telegram.WebApp.initData || '';

    fetch('https://autostatus.nashruz.uz/app/stickers', {
      headers: {
        'initData': `${initData}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const processedData = data.result.map(set => ({
          ...set,
          thumbCustomEmojiId: `${baseUrl}/download/${set.thumbCustomEmojiId}`,
          stickers: set.stickers.map(sticker => ({
            ...sticker,
            id: `${baseUrl}/download/${sticker.id}`,
            thumbnail: sticker.thumbnail ? {
              dataUri: `${baseUrl}/download/${sticker.thumbnail.dataUri}`
            } : undefined
          }))
        }));
        const setsById = processedData.reduce((acc, set) => {
          acc[set.id] = set;
          return acc;
        }, {} as Record<string, any>);

        const setIds = processedData.map(set => set.id)

        setGlobal({
          ...getGlobal(),
          stickers: {
            setsById: setsById,
            added: {},
            recent: {
              stickers: []
            },
            favorite: {
              stickers: []
            },
            greeting: {
              stickers: []
            },
            premium: {
              stickers: []
            },
            featured: {},
            forEmoji: {},
            effect: {
              stickers: [],
              emojis: []
            },
            starGifts: { stickers: {} }
          },
          customEmojis: {
            added: {
              setIds: setIds
            },
            lastRendered: [],
            byId: {},
            forEmoji: {},
            statusRecent: {}
          }
        });

        setStickerSets(processedData);
      })
      .catch(error => {
        console.error('Error fetching sticker sets:', error);
      });
  }, []);

  const baseUrl = 'https://autostatus.nashruz.uz/app';

  const renderStickers = () => {
    if (!Array.isArray(stickerSets) || stickerSets.length === 0) {
      return null;
    }


    const handleCustomEmojiSelect = useLastCallback((emoji: ApiSticker) => {
      console.log('Selected sticker:', emoji);
    });

    return <CustomEmojiPicker
      className='picker-tab'
      isStatusPicker={true}
      loadAndPlay={true}
      onCustomEmojiSelect={handleCustomEmojiSelect}
    />

    const {
      handleScroll: handleContentScroll,
      isAtBeginning: shouldHideTopBorder,
    } = useScrolledState();

    return (
      <div
        // onMouseMove={handleMouseMove}
        style={{
          height: '200px'
        }}
        onScroll={handleContentScroll}
        className={
          buildClassName(
            "main",
            IS_TOUCH_ENV ? 'no-scrollbar' : 'custom-scroll'
          )
        }
      >
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
                containerRef={userImageRef}
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