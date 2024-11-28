import './src/util/handleError';

// Ensure process.env exists
if (typeof process === 'undefined' || !process.env) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}

import React from './src/teact/teact';
import TeactDOM from './src/teact/teact-dom';
import { memo, useRef, useState } from './src/teact/teact';
import type { ApiSticker } from './src/api/types';

import {
  DEBUG, STRICTERDOM_ENABLED,
} from './src/config';
import { enableStrict, requestMutation } from './src/fasterdom/fasterdom';
import { betterView } from './src/util/betterView';
import updateWebmanifest from './src/util/updateWebmanifest';
import AnimatedSticker from './src/AnimatedSticker';
import StickerView from './src/StickerView';

if (STRICTERDOM_ENABLED) {
}

// Set compatibility test to true
(window as any).isCompatTestPassed = true;

const App = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div>
      <StickerView
        containerRef={containerRef}
        size={48}
        fullMediaHash='https://autostatus.nashruz.uz/app/download/thumbnails/5366316836101038579.webp'
        noPlay = {false}

        sticker={{
          id: '453454',
          mediaType: "sticker",
          width: 48,
          height: 48,
          stickerSetInfo: {
            shortName: ''
          },
          isLottie: false,
          isVideo: false,
          isCustomEmoji: true,
          isFree: true
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