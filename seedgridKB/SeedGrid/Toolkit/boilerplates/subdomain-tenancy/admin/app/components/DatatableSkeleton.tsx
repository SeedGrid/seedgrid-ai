"use client";

import { SgSkeleton } from "@seedgrid/fe-components";

type DatatableSkeletonProps = {
  /** Number of columns to mimic. Match the real `SgDatatable` column count. */
  columns?: number;
  /** Number of placeholder body rows. */
  rows?: number;
};

/**
 * Table-shaped loading placeholder for `SgDatatable`. Renders a header row plus
 * several body rows of text skeletons so the loading state reads as a table,
 * instead of a single grey rectangle.
 */
export function DatatableSkeleton({
  columns = 4,
  rows = 5,
}: Readonly<DatatableSkeletonProps>) {
  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div
        className="grid gap-3 border-b border-border p-3"
        style={{ gridTemplateColumns }}
      >
        {Array.from({ length: columns }).map((_, idx) => (
          <SgSkeleton key={idx} shape="text" width="70%" />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="grid gap-3 border-b border-border p-3 last:border-b-0"
          style={{ gridTemplateColumns }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <SgSkeleton
              key={colIdx}
              shape="text"
              width={`${45 + ((rowIdx + colIdx) % 4) * 12}%`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
