import { DEBUG, DEBUG_ALERT_MSG } from '../config';
import { throttle } from './schedulers';

let showError = true;
let error: Error | undefined;

window.addEventListener('error', handleErrorEvent);
window.addEventListener('unhandledrejection', handleErrorEvent);


const throttleError = throttle((err) => {
  if (showError) {
    // eslint-disable-next-line no-alert
    window.alert(getErrorMessage(err));
  } else {
    error = err;
  }
}, 1500);

export function handleError(err: Error) {
  // eslint-disable-next-line no-console
  console.error(err);
  if (DEBUG) {
    throttleError(err);
  }
}

function handleErrorEvent(e: ErrorEvent | PromiseRejectionEvent) {
  // https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
  if (e instanceof ErrorEvent && e.message === 'ResizeObserver loop limit exceeded') {
    return;
  }

  e.preventDefault();
  handleError(e instanceof ErrorEvent ? (e.error || e.message) : e.reason);
}

function getErrorMessage(err: Error) {
  return `${DEBUG_ALERT_MSG}\n\n${(err?.message) || err}\n${err?.stack}`;
}
