import type {
  ApiOnProgress,
  ApiParsedMedia,
  ApiPreparedMedia,
} from '../api/types';
import {
  ApiMediaFormat,
} from '../api/types';

import {
  DEBUG, ELECTRON_HOST_URL,
  MEDIA_CACHE_MAX_BYTES,
  IS_PACKAGED_ELECTRON, MEDIA_CACHE_DISABLED, MEDIA_CACHE_NAME, MEDIA_CACHE_NAME_AVATARS,
} from '../config';
import * as cacheApi from './cacheApi';
import {
  IS_PROGRESSIVE_SUPPORTED,
} from './windowEnvironment';

import { callApi } from '../api/methods';

const asCacheApiType = {
  [ApiMediaFormat.BlobUrl]: cacheApi.Type.Blob,
  [ApiMediaFormat.Text]: cacheApi.Type.Text,
  [ApiMediaFormat.DownloadUrl]: undefined,
  [ApiMediaFormat.Progressive]: undefined,
};

const PROGRESSIVE_URL_PREFIX = `${IS_PACKAGED_ELECTRON ? ELECTRON_HOST_URL : '.'}/progressive/`;
const URL_DOWNLOAD_PREFIX = './download/';
const RETRY_MEDIA_AFTER = 1000;
const MAX_MEDIA_RETRIES = 3;

const memoryCache = new Map<string, ApiPreparedMedia>();
const fetchPromises = new Map<string, Promise<ApiPreparedMedia | undefined>>();
const progressCallbacks = new Map<string, Map<string, ApiOnProgress>>();
const cancellableCallbacks = new Map<string, ApiOnProgress>();

export function fetch<T extends ApiMediaFormat>(
  url: string,
  mediaFormat: T,
  isHtmlAllowed = false,
  onProgress?: ApiOnProgress,
  callbackUniqueId?: string,
): Promise<ApiPreparedMedia> {
  if (mediaFormat === ApiMediaFormat.Progressive) {
    return (
      IS_PROGRESSIVE_SUPPORTED
        ? getProgressive(url)
        : fetch(url, ApiMediaFormat.BlobUrl, isHtmlAllowed, onProgress, callbackUniqueId)
    ) as Promise<ApiPreparedMedia>;
  }

  if (mediaFormat === ApiMediaFormat.DownloadUrl) {
    return (
      IS_PROGRESSIVE_SUPPORTED
        ? getDownloadUrl(url)
        : fetch(url, ApiMediaFormat.BlobUrl, isHtmlAllowed, onProgress, callbackUniqueId)
    ) as Promise<ApiPreparedMedia>;
  }

  if (!fetchPromises.has(url)) {
    const promise = fetchFromCacheOrRemote(url, mediaFormat, isHtmlAllowed)
      .catch((err) => {
        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.warn(err);
        }

        return undefined;
      })
      .finally(() => {
        fetchPromises.delete(url);
        progressCallbacks.delete(url);
        cancellableCallbacks.delete(url);
      });

    fetchPromises.set(url, promise);
  }

  if (onProgress && callbackUniqueId) {
    let activeCallbacks = progressCallbacks.get(url);
    if (!activeCallbacks) {
      activeCallbacks = new Map<string, ApiOnProgress>();
      progressCallbacks.set(url, activeCallbacks);
    }
    activeCallbacks.set(callbackUniqueId, onProgress);
  }

  return fetchPromises.get(url) as Promise<ApiPreparedMedia>;
}

export function getFromMemory(url: string) {
  return memoryCache.get(url) as ApiPreparedMedia;
}

export function removeCallback(url: string, callbackUniqueId: string) {
  const callbacks = progressCallbacks.get(url);
  if (!callbacks) return;
  callbacks.delete(callbackUniqueId);
}

export function getProgressiveUrl(url: string) {
  return `${PROGRESSIVE_URL_PREFIX}${url}`;
}

function getProgressive(url: string) {
  const progressiveUrl = `${PROGRESSIVE_URL_PREFIX}${url}`;

  memoryCache.set(url, progressiveUrl);

  return Promise.resolve(progressiveUrl);
}

function getDownloadUrl(url: string) {
  return Promise.resolve(`${URL_DOWNLOAD_PREFIX}${url}`);
}

export async function fetchFromCacheOrRemote(
  url: string,
  mediaFormat: ApiMediaFormat,
  isHtmlAllowed = false,
  retryNumber = 0,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const cacheName = url.startsWith('avatar') ? MEDIA_CACHE_NAME_AVATARS : MEDIA_CACHE_NAME;
  const cached = await cacheApi.fetch(cacheName, url, asCacheApiType[mediaFormat]!, isHtmlAllowed);

  if (cached) {
    let media = cached;

    const prepared = prepareMedia(media);

    memoryCache.set(url, prepared);

    return prepared;
  }

  const remote = await callApi('downloadMedia', { url, mediaFormat, isHtmlAllowed }, onProgress);
  if (!remote) {
    if (retryNumber >= MAX_MEDIA_RETRIES) {
      throw new Error(`Failed to fetch media ${url}`);
    }
    await new Promise((resolve) => {
      setTimeout(resolve, RETRY_MEDIA_AFTER);
    });
    // eslint-disable-next-line no-console
    if (DEBUG) console.debug(`Retrying to fetch media ${url}`);
    return fetchFromCacheOrRemote(url, mediaFormat, isHtmlAllowed, retryNumber + 1);
  }

  const canCache = mediaFormat !== ApiMediaFormat.Progressive && (
    mediaFormat !== ApiMediaFormat.BlobUrl || (remote.dataBlob as Blob).size <= MEDIA_CACHE_MAX_BYTES
  );

  if (!MEDIA_CACHE_DISABLED && cacheApi && canCache) {
    const cacheName = url.startsWith('avatar') ? MEDIA_CACHE_NAME_AVATARS : MEDIA_CACHE_NAME;
    void cacheApi.save(cacheName, url, remote.dataBlob);
  }

  const prepared = prepareMedia(remote.dataBlob);

  memoryCache.set(url, prepared);

  return prepared;
}

function prepareMedia(mediaData: Exclude<ApiParsedMedia, ArrayBuffer>): ApiPreparedMedia {
  if (mediaData instanceof Blob) {
    return URL.createObjectURL(mediaData);
  }

  return mediaData;
}