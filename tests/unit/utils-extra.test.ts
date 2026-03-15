import {
  copyToClipboard,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getFromStorage,
  isEnterKey,
  isEscapeKey,
  randomId,
  removeFromStorage,
  scrollToElement,
  scrollToTop,
  setToStorage,
  sleep,
  throttle,
  debounce,
} from '@/lib/utils';

describe('additional utility coverage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    localStorage.clear();
  });

  it('formats relative and absolute dates', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-11T12:00:00Z'));

    expect(formatRelativeTime('2026-03-11T11:59:00Z')).toContain('minute');
    expect(formatDate('2026-03-11')).toContain('2026');
    expect(formatDateTime('2026-03-11T09:30:00')).toContain('2026');
  });

  it('debounces calls until the delay passes', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const debounced = debounce(fn, 200);

    debounced('first');
    debounced('second');

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
  });

  it('throttles repeated calls within the limit', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled('first');
    throttled('second');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('first');

    jest.advanceTimersByTime(100);
    throttled('third');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('third');
  });

  it('resolves sleep after the requested duration', async () => {
    jest.useFakeTimers();
    const done = sleep(50);

    jest.advanceTimersByTime(50);

    await expect(done).resolves.toBeUndefined();
  });

  it('copies text to the clipboard and returns false on failure', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await expect(copyToClipboard('lobster')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('lobster');

    writeText.mockRejectedValueOnce(new Error('no clipboard'));
    await expect(copyToClipboard('again')).resolves.toBe(false);
  });

  it('reads, writes, and removes local storage values safely', () => {
    setToStorage('agent', { id: 1, name: 'lobster' });
    expect(getFromStorage('agent', null)).toEqual({ id: 1, name: 'lobster' });

    localStorage.setItem('broken', '{');
    expect(getFromStorage('broken', 'fallback')).toBe('fallback');

    removeFromStorage('agent');
    expect(getFromStorage('agent', 'missing')).toBe('missing');
  });

  it('scroll helpers call the expected browser APIs', () => {
    const scrollTo = jest.fn();
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    });

    const element = document.createElement('div');
    element.id = 'target';
    element.scrollIntoView = jest.fn();
    document.body.appendChild(element);

    scrollToTop();
    scrollToElement('target');

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(element.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('detects enter and escape keyboard shortcuts', () => {
    expect(isEnterKey({ key: 'Enter', shiftKey: false } as KeyboardEvent)).toBe(true);
    expect(isEnterKey({ key: 'Enter', shiftKey: true } as KeyboardEvent)).toBe(false);
    expect(isEscapeKey({ key: 'Escape' } as KeyboardEvent)).toBe(true);
    expect(isEscapeKey({ key: 'A' } as KeyboardEvent)).toBe(false);
  });

  it('creates a random id with the requested length', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

    expect(randomId(5)).toHaveLength(5);
  });
});
