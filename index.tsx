import './src/util/handleError';

import React from './src/teact/teact';
import TeactDOM from './src/teact/teact-dom';
import { getGlobal, setGlobal } from './src/global';
import { memo, useRef, useState, useEffect } from './src/teact/teact';
import StickerView from './src/StickerView';
import CustomEmojiPicker from './src/CustomEmojiPicker'
import Button from './src/Button'
import { ApiSticker, ApiStickerSet } from './src/api/types'
import animateHorizontalScroll from './src/util/animateHorizontalScroll';
import buildClassName from './src/util/buildClassName';
import useHorizontalScroll from './src/hooks/useHorizontalScroll';
import useAppLayout from './src/hooks/useAppLayout';

import './src/styles/index.scss';
import pickerStyles from './src/StickerPicker.module.scss';
import './src/StickerButton.scss';
import style from './src/index.module.scss';


(window as any).isCompatTestPassed = true;

const AutoStatusApp = memo(() => {
  const [stickerSets, setStickerSets] = useState<ApiStickerSet[]>([]);
  const [duration, setDuration] = useState(0); 
  const [selectedStickers, setSelectedStickers] = useState<ApiSticker[]>([]);
  const [stickerPackHeight, setStickerPackHeight] = useState(235)
  const userImageRef = useRef<HTMLDivElement>(null);
  const userContainerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const height = window.innerHeight - ((userContainerRef.current?.clientHeight ?? 0) + (sliderRef.current?.clientHeight ?? 0)) - 24
    console.log("height changed", height)
    setStickerPackHeight(height)
  }, [userContainerRef.current?.clientHeight, sliderRef.current?.clientHeight, ])


  window.Telegram.WebApp.MainButton.text = "Save";
  window.Telegram.WebApp.MainButton.show();

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
          isEmoji: true,
          stickers: set.stickers.map(sticker => ({
            ...sticker,
            id: `${baseUrl}/download/${sticker.id}`,
            thumbnail: sticker.thumbnail ? {
              dataUri: `${baseUrl}/download/${sticker.thumbnail.dataUri}`
            } : undefined,
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

  const handleCustomEmojiSelect = (sticker: ApiSticker) => {
    setSelectedStickers(prevStickers => {
      // If sticker already exists, remove it (toggle behavior)
      const existingIndex = prevStickers.findIndex(s => s.id === sticker.id);
      if (existingIndex !== -1) {
        const newStickers = [...prevStickers];
        newStickers.splice(existingIndex, 1);
        return newStickers;
      }
      // Add new sticker
      return [...prevStickers, sticker];
    });

    setStickerSets(prevSets => {
      if (!prevSets.length) {
        return [{ id: 'selected', title: 'Selected', stickers: [sticker] }];
      }
      return [{ ...prevSets[0], stickers: [sticker] }];
    });
  };

  const renderStickers = () => {
    if (!Array.isArray(stickerSets) || stickerSets.length === 0) {
      return null;
    }

    console.log("height", stickerPackHeight)

    return <CustomEmojiPicker
      className='picker-tab'
      isStatusPicker={true}
      loadAndPlay={true}
      isTranslucent={true}
      selectedReactionIds={selectedStickers.map(s => s.id)}
      onCustomEmojiSelect={handleCustomEmojiSelect}
      customHeight={stickerPackHeight}
    />
  };


  const { isMobile } = useAppLayout();

  const headerRef = useRef<HTMLDivElement>(null);
  const sharedCanvasHqRef = useRef<HTMLCanvasElement>(null);
  useHorizontalScroll(headerRef, isMobile);

  // Scroll container and header when active set changes
  const HEADER_BUTTON_WIDTH = 36
  const activeSetIndex = 0
  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const newLeft = activeSetIndex * HEADER_BUTTON_WIDTH - (header.offsetWidth / 2 - HEADER_BUTTON_WIDTH / 2);

    animateHorizontalScroll(header, newLeft);
  }, [activeSetIndex]);
  const headerClassName = buildClassName(
    pickerStyles.header,
    'no-scrollbar'
  );

  return (
    <div className={style.container}>
      <div ref={userContainerRef} className={style.userContainer}>
        <div className={style.userName}>
          {window.Telegram.WebApp.initDataUnsafe.user?.first_name || 'User'}
        </div>
        <div className={style.userImage}
          style={{
            backgroundImage: `url(${baseUrl}/download/thumbnails/image.jpg)`
          }}>
          {selectedStickers.length > 0 && (
            <div className={style.stickerContainer}>
              <div
                className={`${style.stickerButton} StickerButton`}
                ref={userImageRef}>
                <StickerView
                  containerRef={userImageRef}
                  sticker={selectedStickers[0]}
                  size={40}
                  noPlay={false}
                  shouldLoop={true}
                  isSmall
                />
              </div>
            </div>
          )}
        </div>
        {/* <div
            ref={headerRef}
            className={headerClassName}
          > */}
            <div className={style.selectedStickers}>
              <canvas ref={sharedCanvasHqRef} className="shared-canvas" />
              {
                selectedStickers.map((sticker) => (
                  <div
                  className='StickerButton'
                  ref={userImageRef}
                  style={{
                    height: '36px',
                    width: '36px',
                    position: 'relative'
                  }}>
                  <StickerView
                    containerRef={userImageRef}
                    sticker={sticker}
                    size={36}
                    noPlay={false}
                    shouldLoop={true}
                    isSmall
                  />
                </div>
                ))
              }
            </div>
          {/* </div> */}
      </div>
      <div className={style.durationSliderContainer} ref={sliderRef}>
        <div className={style.durationHeader}>
          <span className={style.durationLabel}>Duration</span>
          <span className={style.durationValue}>{Math.floor(duration / 60)} hours</span>
        </div>
        <input
          type="range"
          min="10"
          max="1440"
          step="10"
          className={style.slider}
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
      <div className={style.stickerPack} style={{ width: '100%', flexGrow: 1, marginBottom: '16px', padding: '0 16px' }}>
        {renderStickers()}
      </div>
    </div>
  );
});

TeactDOM.render(<AutoStatusApp />, document.getElementById('root'));