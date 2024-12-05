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
  const [duration, setDuration] = useState(10);
  const [selectedStickers, setSelectedStickers] = useState<ApiSticker[]>([]);
  const [stickerPackHeight, setStickerPackHeight] = useState(235)
  const userImageRef = useRef<HTMLDivElement>(null);
  const userContainerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const height = window.innerHeight - ((userContainerRef.current?.clientHeight ?? 0) + (sliderRef.current?.clientHeight ?? 0)) - 24
    console.log("height changed", height)
    setStickerPackHeight(height)
  }, [userContainerRef.current?.clientHeight, sliderRef.current?.clientHeight,])


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

  const minuteSwitch = () => {
    let value = 10
    switch (duration) {
      case 5:
        value = 0
        break
      case 10:
        value = 5
        break
      case 15:
        value = 10
        break
      case 20:
        value = 15
        break
      case 25:
        value = 20
        break
      case 30:
        value = 25
        break
      case 45:
        value = 30
        break
      case 60:
        value = 35
        break
      case 120:
        value = 40
        break
      case 180:
        value = 45
        break
      case 240:
        value = 50
        break
      case 300:
        value = 55
        break
      case 360:
        value = 60
        break
      case 540:
        value = 65
        break
      case 720:
        value = 70
        break
      case 960:
        value = 75
        break
      case 1080:
        value = 80
        break
      case 1200:
        value = 85
        break
      case 1440:
        value = 90
        break
      case 2160:
        value = 95
        break
      case 2880:
        value = 100
        break
    }
    return value
  }

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
          <span className={style.durationValue}>
            {
              duration < 60 ? duration + " minutes" : duration == 60 ? "1 hour" : (duration / 60) + " hours"
            }
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          className={style.slider}
          value={minuteSwitch()}
          onChange={(e) => {
            const value = Number(e.target.value);
            let minute = 10
            switch (value) {
              case 0:
                minute = 5
                break
              case 5:
                minute = 10
                break
              case 10:
                minute = 15
                break
              case 15:
                minute = 20
                break
              case 20:
                minute = 25
                break
              case 25:
                minute = 30
                break
              case 30:
                minute = 45
                break
              case 35:
                minute = 60
                break
              case 40:
                minute = 120
                break
              case 45:
                minute = 180
                break
              case 50:
                minute = 240
                break
              case 55:
                minute = 300
                break
              case 60:
                minute = 360
                break
              case 65:
                minute = 540
                break
              case 70:
                minute = 720
                break
              case 75:
                minute = 960
                break
              case 80:
                minute = 1080
                break
              case 85:
                minute = 1200
                break
              case 90:
                minute = 1440
                break
              case 95:
                minute = 2160
                break
              case 100:
                minute = 2880
                break
            }
            setDuration(minute);
            e.target.style.setProperty('--slider-percentage', `${value}%`);
          }}
          style={{ '--slider-percentage': `${minuteSwitch()}%` } as React.CSSProperties}
        />
      </div>
      <div className={style.stickerPack} style={{ width: '100%', flexGrow: 1, marginBottom: '16px', padding: '0 16px' }}>
        {renderStickers()}
      </div>
    </div>
  );
});

TeactDOM.render(<AutoStatusApp />, document.getElementById('root'));