"use client";

import { SgInputText, type SgInputTextProps } from "@seedgrid/fe-components";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { useEffect, useMemo, useRef, useState } from "react";

type SgInputTextSearchProps = Omit<SgInputTextProps, "onChange"> & {
  minChars?: number;
  debounceMs?: number;
  onChange?: (value: string) => void;
  onSearchChange: (value: string) => void;
};

export function SgInputTextSearch({
  minChars = 3,
  debounceMs = 350,
  onChange,
  onSearchChange,
  ...props
}: Readonly<SgInputTextSearchProps>) {
  const [value, setValue] = useState("");
  const changes$ = useMemo(() => new Subject<string>(), []);

  // Keep the latest callback in a ref so the subscription below is created once
  // and is not torn down (cancelling the in-flight debounce) on every parent
  // re-render that hands us a new `onSearchChange` identity.
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  useEffect(() => {
    const subscription = changes$
      .pipe(
        map((raw) => raw.trim()),
        debounceTime(debounceMs),
        distinctUntilChanged(),
      )
      .subscribe((nextValue) => {
        if (nextValue.length === 0 || nextValue.length >= minChars) {
          onSearchChangeRef.current(nextValue);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [changes$, debounceMs, minChars]);

  return (
    <SgInputText
      {...props}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange?.(nextValue);
        changes$.next(nextValue);
      }}
      inputProps={{
        ...(props.inputProps ?? {}),
        value,
      }}
    />
  );
}
