import './src/util/handleError';

import React from './src/teact/teact';
import TeactDOM from './src/teact/teact-dom';

import { getGlobal, setGlobal } from './src/global';
import { memo, useRef, useState, useEffect, useCallback } from './src/teact/teact';
import StickerView from './src/StickerView';
import CustomEmojiPicker from './src/CustomEmojiPicker'
import { ApiSticker, ApiStickerSet } from './src/api/types'
import animateHorizontalScroll from './src/util/animateHorizontalScroll';
import buildClassName from './src/util/buildClassName';
import useHorizontalScroll from './src/hooks/useHorizontalScroll';
import useAppLayout from './src/hooks/useAppLayout';

import {
  DEBUG,
} from './src/config';

import './src/styles/index.scss';
import pickerStyles from './src/StickerPicker.module.scss';
import './src/StickerButton.scss';
import style from './src/index.module.scss';

export interface ApiUser {
  id: number,
  firstName: string;
  lastname?: string
  username?: string;
  statusUpdateInterval?: number
  stickers: ApiSticker[]
}

(window as any).isCompatTestPassed = true;

const baseUrl = 'https://autostatus.nashruz.uz/app';

const hasEmojiAccess = async (customEmojiId: string): Promise<boolean> => {
  try {
    const resp = await fetch('https://autostatus.nashruz.uz/app/emojiSet', {
      method: 'POST',
      headers: {
        'initData': `${initData}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(
        {
          'customEmojiId': `${customEmojiId}`
        }
      )
    })
    return (await resp.json()).result == true
  } catch (e) {
    console.error('Error emojiSet', e);
    return false
  }
}

let initData = ''

const AutoStatusApp = memo(() => {
  console.log("render app")
  const [stickerSets, setStickerSets] = useState<ApiStickerSet[]>([]);
  const [selectedStickers, setSelectedStickers] = useState<ApiSticker[]>([]);
  const [duration, setDuration] = useState(10);
  const [mainButtonEnabled, setMainButtonEnabled] = useState<number>(0);

  const [stickerPackHeight, setStickerPackHeight] = useState(235)
  const userImageRef = useRef<HTMLDivElement>(null);
  const userContainerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const sharedCanvasHqRef = useRef<HTMLCanvasElement>(null)

  const [isSelecting, setIsSelecting] = useState(false);

  const handleCustomEmojiSelect = useCallback((sticker: ApiSticker) => {
    if (isSelecting) return;
    setIsSelecting(true);
    
    setSelectedStickers(prevStickers => {
      const existingIndex = prevStickers.findIndex(s => s.id === sticker.id);
      if (existingIndex !== -1) {
        return prevStickers.filter(s => s.id !== sticker.id);
      }
      return [...prevStickers, sticker];
    });

    // Reset selection lock after a short delay
    setTimeout(() => {
      setIsSelecting(false);
    }, 100);
  }, [isSelecting]);

  const save = useCallback(async (stickers: ApiSticker[]) => {
    try {
      const user = webApp.initDataUnsafe.user
      if (user != null) {
        webApp.MainButton.showProgress(false)
        const resp = await fetch('https://autostatus.nashruz.uz/app/user', {
          method: 'POST',
          headers: {
            'initData': `${initData}`,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            'firstName': `${user.first_name}`,
            'username': `${user.username}`,
            'languageCode': `${user.language_code}`,
            'isPremium': user.is_premium,
            'statusUpdateInterval': duration,
            'currentEmojiId': stickers.length == 0 ? null : stickers[0].customEmojiId,
            'stickers': stickers.map(sticker => sticker.customEmojiId)
          })
        })

        try {
          if (resp.status === 200) {
            webApp.showPopup({
              message: "Saved",
              buttons: [{ type: 'ok', id: 'ok' }]
            })
          } else {
            webApp.showPopup({
              message: "Error",
              buttons: [{ type: 'ok', id: 'ok' }]
            })
          }
        } catch (e) {
          console.error('Popup error:', e);
        }

        return resp.status === 200
      }
      return false
    } catch (e) {
      console.error('Save error:', e);
      try {
        webApp.showPopup({
          message: "Error",
          buttons: [{ type: 'ok', id: 'ok' }]
        })
      } catch (e) {
        console.error('Popup error:', e);
      }
      return false
    } finally {
      webApp.MainButton.hideProgress()
    }
  }, [duration]);

  const handleMainButtonClick = useCallback(async () => {
    if (selectedStickers.length > 0) {
      const firstEmoji = selectedStickers[0];
      const hasAccess = await hasEmojiAccess(firstEmoji.customEmojiId)

      if (hasAccess) {
        await save(selectedStickers)
      } else {
        webApp.requestEmojiStatusAccess(async (value: boolean) => {
          const hasAccess = await hasEmojiAccess(firstEmoji.customEmojiId)
          if (hasAccess) {
            await save(selectedStickers)
          } else {
            webApp.MainButton.hideProgress()
          }
        })
      }
    } else {
      await save(selectedStickers)
    }
  }, [selectedStickers, save]);

  useEffect(() => {
    const handler = handleMainButtonClick;
    webApp.onEvent("mainButtonClicked", handler);
    return () => {
      webApp.offEvent("mainButtonClicked", handler);
    }
  }, [handleMainButtonClick]);

  useEffect(() => {
    const height = window.innerHeight - ((userContainerRef.current?.clientHeight ?? 0) + (sliderRef.current?.clientHeight ?? 0)) - 24
    setStickerPackHeight(height)
  }, [userContainerRef.current?.clientHeight, sliderRef.current?.clientHeight,])

  const webApp = window.Telegram.WebApp;
  initData = webApp.initData || '';

  webApp.MainButton.text = "Save";
  webApp.MainButton.show();

  useEffect(() => {
    webApp.ready();

    fetch('https://autostatus.nashruz.uz/app/user', {
      headers: {
        'initData': `${initData}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const processedData = data.result;
        processedData.stickers = processedData.stickers.map(sticker => ({
          ...sticker,
          id: `${baseUrl}/download/${sticker.id}`,
          thumbnail: sticker.thumbnail ? {
            dataUri: `${baseUrl}/download/${sticker.thumbnail.dataUri}`
          } : undefined,
        }));

        setSelectedStickers(processedData.stickers)
        setDuration(Math.max(processedData.statusUpdateInterval ?? 10, 10))
      })
      .catch(error => {
        console.error('Error fetching sticker sets:', error);
      });

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

  const renderStickers = () => {
    if (!Array.isArray(stickerSets) || stickerSets.length === 0) {
      return null;
    }

    return <CustomEmojiPicker
      className='picker-tab'
      isStatusPicker={true}
      loadAndPlay={true}
      isTranslucent={false}
      selectedReactionIds={selectedStickers.map(s => s.id)}
      onCustomEmojiSelect={handleCustomEmojiSelect}
      customHeight={stickerPackHeight}
    />
  };

  const { isMobile } = useAppLayout();

  useHorizontalScroll(headerRef, isMobile);

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
          {webApp.initDataUnsafe.user?.first_name || 'User'}
        </div>
        <div className={style.userImage}
          style={{
            backgroundImage:
            `url(${webApp.initDataUnsafe.user?.photo_url})`
              // DEBUG ? `url(${baseUrl}/download/thumbnails/image.jpg)` : `url(${webApp.initDataUnsafe.user?.photo_url})`
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