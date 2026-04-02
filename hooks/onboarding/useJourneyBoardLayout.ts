import { useCallback, useState } from "react";
import {
  JOURNEY_BOARD_DAYS,
  JOURNEY_GRID_COLUMNS,
  JOURNEY_GRID_GAP,
  JOURNEY_GRID_ROWS,
  JOURNEY_GRID_SIDE_PADDING,
  JOURNEY_GRID_VERTICAL_PADDING,
} from "@/constants/onboarding/journey";

export type JourneyBoardLayout = {
  onJourneyGridLayout: (width: number, height: number) => void;
  journeyRows: number[][];
  journeyCellSize: number;
  journeyColumnGap: number;
  journeyRowGap: number;
  journeyGridContentHeight: number;
  journeyGridContentWidth: number;
};

/** Name-journey step: board grid measurements from onLayout + derived cell geometry. */
export function useJourneyBoardLayout(): JourneyBoardLayout {
  const [journeyGridSize, setJourneyGridSize] = useState({ width: 0, height: 0 });

  const onJourneyGridLayout = useCallback((width: number, height: number) => {
    setJourneyGridSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const journeyRowCount = JOURNEY_GRID_ROWS;
  const journeyTotalHorizontalPadding = JOURNEY_GRID_SIDE_PADDING * 2;
  const journeyTotalVerticalPadding = JOURNEY_GRID_VERTICAL_PADDING * 2;
  const journeyInnerWidth = Math.max(0, journeyGridSize.width - journeyTotalHorizontalPadding);
  const journeyInnerHeight = Math.max(0, journeyGridSize.height - journeyTotalVerticalPadding);
  const journeyColumnGap = JOURNEY_GRID_GAP;
  const journeyRowGap = JOURNEY_GRID_GAP;
  const journeyCellSize =
    journeyGridSize.width > 0 && journeyGridSize.height > 0
      ? Math.max(
          16,
          Math.min(
            Math.floor(
              (journeyInnerWidth - journeyColumnGap * (JOURNEY_GRID_COLUMNS - 1)) / JOURNEY_GRID_COLUMNS
            ),
            Math.floor((journeyInnerHeight - journeyRowGap * (journeyRowCount - 1)) / journeyRowCount)
          )
        )
      : 22;
  const journeyGridContentHeight = journeyCellSize * journeyRowCount + journeyRowGap * (journeyRowCount - 1);
  const journeyGridContentWidth =
    journeyCellSize * JOURNEY_GRID_COLUMNS + journeyColumnGap * (JOURNEY_GRID_COLUMNS - 1);

  const journeyRows = Array.from({ length: journeyRowCount }, (_, rowIndex) => {
    const start = rowIndex * JOURNEY_GRID_COLUMNS;
    return Array.from({ length: JOURNEY_GRID_COLUMNS }, (_, colIndex) => start + colIndex).filter(
      (dayIndex) => dayIndex < JOURNEY_BOARD_DAYS
    );
  });

  return {
    onJourneyGridLayout,
    journeyRows,
    journeyCellSize,
    journeyColumnGap,
    journeyRowGap,
    journeyGridContentHeight,
    journeyGridContentWidth,
  };
}
