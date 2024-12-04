import './src/util/handleError';

import React from './src/teact/teact';
import TeactDOM from './src/teact/teact-dom';
import { getGlobal, setGlobal } from './src/global';
import { memo, useRef, useState, useEffect } from './src/teact/teact';
import StickerView from './src/StickerView';
import CustomEmojiPicker from './src/CustomEmojiPicker'
import Button from './src/Button'
import { ApiSticker, ApiStickerSet } from './src/api/types'
import useLastCallback from './src/hooks/useLastCallback';


import './src/styles/index.scss';
import sliderStyle from './src/Slider.module.scss';


(window as any).isCompatTestPassed = true;

const AutoStatusApp = memo(() => {
  const [stickerSets, setStickerSets] = useState<ApiStickerSet[]>([]);
  const [duration, setDuration] = useState(480); // 8 hours in minutes
  const userImageRef = useRef<HTMLDivElement>(null);
  const userContainerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const [stickerPackHeight, setStickerPackHeight] = useState(235)

  useEffect(() => {
    setStickerPackHeight(window.innerHeight - ((userContainerRef.current?.clientHeight ?? 0) + (sliderRef.current?.clientHeight ?? 0) + (buttonRef.current?.clientHeight ?? 0) + 50))
  }, [userContainerRef.current?.clientHeight, sliderRef.current?.clientHeight, buttonRef.current?.clientHeight])


  useEffect(() => {
    window.Telegram.WebApp.ready();

    window.Telegram.WebApp;

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

  const renderStickers = () => {
    if (!Array.isArray(stickerSets) || stickerSets.length === 0) {
      return null;
    }


    const handleCustomEmojiSelect = useLastCallback((emoji: ApiSticker) => {
      console.log('Selected sticker:', emoji);
    });

    console.log("height", stickerPackHeight)

    return <CustomEmojiPicker
      className='picker-tab'
      isStatusPicker={true}
      loadAndPlay={true}
      isTranslucent = {true}
      onCustomEmojiSelect={handleCustomEmojiSelect}
      customHeight={stickerPackHeight}
    />
  };

  return (
    <div className="container" style={{ width: '100%', display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100vh" }}>
      <div ref={userContainerRef} className="user-image-container" style={{
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
      <div className={sliderStyle.durationSliderContainer} ref={sliderRef}>
        <div className={sliderStyle.durationHeader}>
          <span className={sliderStyle.durationLabel}>Duration</span>
          <span className={sliderStyle.durationValue}>{Math.floor(duration / 60)} hours</span>
        </div>
        <input
          type="range"
          min="10"
          max="1440"
          step="10"
          className={sliderStyle.slider}
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
      <div className="sticker-pack" style={{ width: '100%', flexGrow: 1 }}>
        {renderStickers()}
      </div>
      <div ref={buttonRef}>
        <Button
          key="save_button"
          className="Save_Button"
          ariaLabel={"Label"}
          pill
          onClick={() => { }}
        >
          {(
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
});

TeactDOM.render(<AutoStatusApp />, document.getElementById('root'));