import './animated_sticker/src/util/handleError';

// Ensure process.env exists
if (typeof process === 'undefined' || !process.env) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}

import React from './animated_sticker/src/teact/teact';
import TeactDOM from './animated_sticker/src/teact/teact-dom';
import { memo, useRef, useState } from './animated_sticker/src/teact/teact';

import { DEBUG } from './animated_sticker/src/config';
import StickerView from './animated_sticker/src/StickerView';

// Set compatibility test to true
(window as any).isCompatTestPassed = true;

const App = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div 
            ref={containerRef}
            style={{
              width: '48px',
              height: '48px',
              position: 'relative'
            }}
            >
      <StickerView
        containerRef={containerRef}
        size={48}
        // Using proxy for both thumbnail and sticker
        fullMediaHash='https://autostatus.nashruz.uz/app/download/stickers/5366316836101038579.tgs'
        noPlay={false}
        fullMediaClassName="full-media"
        shouldLoop = {true}
        sticker={{
          id: '453454',
          mediaType: "sticker",
          width: 48,
          height: 48,
          stickerSetInfo: {
            shortName: ''
          },
          isLottie: true,
          isVideo: false,
          isCustomEmoji: true,
          isFree: true,
          thumbnail: {
            width: 128,
            height: 128,
            dataUri: "https://autostatus.nashruz.uz/app/download/thumbnails/5366316836101038579.webp"
          }
        }}
      />
      </div>

      {/* <div style={{display:'flex'}}>
        {[1,2,3,4,5,6,7,8,9,10].map(elem =>
          <div key={elem} style={{display:'flex',flexDirection:'column'}}>
            {[1,2,3,4,5,6,7,8,9,10].map(innerElem =>
              <AnimatedSticker 
                key={`${elem}-${innerElem}`}
                renderId={String(innerElem)}
                size={48}
                tgsUrl='https://autostatus.nashruz.uz/app/download/stickers/5366316836101038579.tgs'
                onLoad={() => console.log('Sticker loaded!')}
                play={true}
              />
            )}
          </div>
        )}
      </div> */}
    </div>
  );
});

init();

async function init() {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('>>> INIT');
  }

  console.log('Compatibility test:', (window as any).isCompatTestPassed);
  console.log('Process env:', process.env);
  
  if (!(window as any).isCompatTestPassed) {
    console.error('Compatibility test failed');
    return;
  }

  console.log('Attempting to render App...');

  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement);

  TeactDOM.render(
    <App />,
    rootElement!,
  );

  console.log('Render attempt completed');
}