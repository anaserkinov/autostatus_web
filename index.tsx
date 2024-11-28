import './src/util/handleError';
import { memo, useRef, useState } from './src/teact/teact';
import type { ApiSticker } from './src/api/types';


// Ensure process.env exists
if (typeof process === 'undefined' || !process.env) {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}

import React from './src/teact/teact';
import TeactDOM from './src/teact/teact-dom';

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

  console.log('Attempting to render AnimatedSticker...');

  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement);

  //https://autostatus.nashruz.uz/app/download/stickers/5366316836101038579.tgs
  //https://autostatus.nashruz.uz/app/download/thumbnails/5366316836101038579.webp
  let containerRef = useRef<HTMLDivElement>(null);

  TeactDOM.render(
    <div>
      <StickerView
      containerRef={containerRef}
      sticker={
        {
          id: '',
          mediaType: "sticker",
          stickerSetInfo: {
            shortName: ''
          },
          isLottie: false,
          isVideo: false,
          isCustomEmoji: true
        }
      }
      />

      <div style={{display:'flex'}}>
        {[1,2,3,4,5,6,7,8,9,10].map(elem=>
        <div style={{display:'flex',flexDirection:'column'}}>
        {[1,2,3,4,5,6,7,8,9,10].map(elem=>
        <AnimatedSticker 
          renderId={elem as any}
          size={48}
          tgsUrl='https://autostatus.nashruz.uz/app/download/stickers/5366316836101038579.tgs'
          onLoad={() => console.log('Sticker loaded!')}
          play={true}
          />
          )}
        </div>
        )}
      </div>
    </div>,
    rootElement!,
  );

  console.log('Render attempt completed');
}