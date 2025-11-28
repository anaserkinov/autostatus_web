import { ApiMediaFormat } from './types';

type DownloadMediaParams = {
  url: string;
  mediaFormat: ApiMediaFormat;
  isHtmlAllowed?: boolean;
};

type DownloadMediaResponse = {
  dataBlob: Blob;
};

export async function callApi(
  method: 'downloadMedia',
  params: DownloadMediaParams,
  onProgress?: (progress: number) => void,
): Promise<DownloadMediaResponse | undefined> {
  if (method === 'downloadMedia') {
    try {
      const response = await fetch(params.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create a reader to track progress
      const reader = response.body?.getReader();
      const contentLength = response.headers.get('Content-Length');
      const totalLength = contentLength ? parseInt(contentLength, 10) : 0;
      
      if (!reader) {
        throw new Error('Response body is null');
      }

      // Read the response stream
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;

        if (onProgress && totalLength) {
          onProgress((receivedLength / totalLength) * 100);
        }
      }

      // Concatenate chunks into a single Uint8Array
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      // Convert to blob
      const blob = new Blob([chunksAll], { 
        type: response.headers.get('Content-Type')?.toString()
      });

      return { dataBlob: blob };
    } catch (error) {
      console.error('Error downloading media:', error);
      return undefined;
    }
  }

  throw new Error(`Unknown method: ${method}`);
}
