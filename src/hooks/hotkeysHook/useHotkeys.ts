//@ts-nocheck
import hotkeys from "../hotkeys"; //{ HotkeysEvent, KeyHandler }
import React, { useCallback, useEffect } from "react";

type AvailableTags = "INPUT" | "TEXTAREA" | "SELECT";

// We implement our own custom filter system.

const tagFilter = (
  { target }: KeyboardEvent,
  enableOnTags?: AvailableTags[]
) => {
  const targetTagName = target && (target as HTMLElement).tagName;

  return Boolean(
    targetTagName &&
      enableOnTags &&
      enableOnTags.includes(targetTagName as AvailableTags)
  );
};

const isKeyboardEventTriggeredByInput = (ev: KeyboardEvent) => {
  return tagFilter(ev, ["INPUT", "TEXTAREA", "SELECT"]);
};
export interface HotkeysEvent {
  key: string;
  method: KeyHandler;
  mods: number[];
  scope: string;
  shortcut: string;
}

export interface KeyHandler {
  (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent): void | boolean;
}

export type Options = {
  enabled?: boolean; // Main setting that determines if the hotkey is enabled or not. (Default: true)
  filter?: typeof hotkeys.filter; // A filter function returning whether the callback should get triggered or not. (Default: undefined)
  filterPreventDefault?: boolean; // Prevent default browser behavior if the filter function returns false. (Default: true)
  enableOnTags?: AvailableTags[]; // Enable hotkeys on a list of tags. (Default: [])
  enableOnContentEditable?: boolean; // Enable hotkeys on tags with contentEditable props. (Default: false)
  splitKey?: string; // Character to split keys in hotkeys combinations. (Default +)
  scope?: string; // Scope. Currently not doing anything.
  keyup?: boolean; // Trigger on keyup event? (Default: undefined)
  keydown?: boolean; // Trigger on keydown event? (Default: true)
};

export function useHotkeys<T extends Element>(
  keyActionMap: Record<string, Function>,
  ref: React.MutableRefObject<T | null>,
  options?: Options
);
export function useHotkeys<T extends Element>(
  keys: string,
  callback: KeyHandler,
  ref: React.MutableRefObject<T | null>,
  options?: Options
);
export function useHotkeys<T extends Element>(
  keys: string,
  callback: KeyHandler,
  ref: React.MutableRefObject<T | null>,
  deps?: any[]
);
export function useHotkeys<T extends Element>(
  keys: string,
  callback: KeyHandler,
  ref: React.MutableRefObject<T | null>,
  options?: Options,
  deps?: any[]
);
export function useHotkeys<T extends Element>(
  keys: string,
  callback: KeyHandler,
  ref: React.MutableRefObject<T | null>,
  options?: any[] | Options,
  deps?: any[]
) {
  if (options instanceof Array) {
    deps = options;
    options = undefined;
  }

  const {
    enableOnTags,
    filter,
    keyup,
    keydown,
    filterPreventDefault = true,
    enabled = true,
    enableOnContentEditable = false,
  } = (options as Options) || {};

  // The return value of this callback determines if the browsers default behavior is prevented.
  const memoisedCallback = useCallback(
    (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
      if (filter && !filter(keyboardEvent)) {
        console.log("filtered");
        return !filterPreventDefault;
      }

      // Check whether the hotkeys was triggered inside an input and that input is enabled or if it was triggered by a content editable tag and it is enabled.
      if (
        (isKeyboardEventTriggeredByInput(keyboardEvent) &&
          !tagFilter(keyboardEvent, enableOnTags)) ||
        ((keyboardEvent.target as HTMLElement)?.isContentEditable &&
          !enableOnContentEditable)
      ) {
        return true;
      }

      if (
        ref.current === null ||
        document.activeElement === ref.current ||
        ref.current?.contains(document.activeElement)
      ) {
        callback(keyboardEvent, hotkeysEvent);
        return true;
      }

      return false;
    },
    deps ? [ref, enableOnTags, filter, ...deps] : [ref, enableOnTags, filter]
  );

  useEffect(() => {
    if (!enabled) {
      hotkeys.unbind(keys, memoisedCallback);

      return;
    }

    // In this case keydown is likely undefined, so we set it to false,
    // since hotkeys sets `keydown` to true in absense of explicit setting.
    if (keyup && keydown !== true) {
      (options as Options).keydown = false;
    }

    hotkeys(keys, (options as Options) || {}, memoisedCallback);

    return () => hotkeys.unbind(keys, memoisedCallback);
  }, [memoisedCallback, keys, enabled]);
}
