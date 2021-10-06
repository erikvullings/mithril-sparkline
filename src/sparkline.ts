import m, { Component } from 'mithril';

export type SparklineEntry = { value: number };

export type SparklineMouseMove<T = SparklineEntry> = {
  data: T;
  x: number;
  y: number;
  index: number;
};

export type SparklineOptions<T = SparklineEntry> = {
  /**
   * This function will be called whenever the mouse moves over the SVG.
   * You can use it to render something like a tooltip.
   */
  onmousemove: (event: MouseEvent, value: SparklineMouseMove<T>) => void;
  /**
   * This function will be called whenever the mouse leaves the SVG area.
   * You can use it to hide the tooltip.
   */
  onmouseout: (event: MouseEvent) => void;
  /**
   * Should we run in interactive mode?
   * If yes, this will handle the cursor and spot position when moving the mouse.
   */
  interactive?: boolean;
  /**
   * Define the size of the spot area.
   * @default 2
   */
  spotRadius?: number;
  /**
   * Define the width of the cursor (vertical line).
   * @default 2
   */
  cursorWidth?: number;
  /**
   * By default, data must be formatted as an array of numbers or
   * an array of objects with the value key (like `[{value: 1}]`).
   * You can set a custom function to return data for a different data structure.
   */
  fetch?: (entry: T[]) => number;
};

const Sparkline = <T = SparklineEntry>(): Component<{
  entries: T[];
  width: number;
  height: number;
  strokeWidth: number;
  options: SparklineOptions<T>;
}> => {
  // Some arbitrary value to remove the cursor and spot out of the viewing canvas.
  const offscreen = -1000;

  // State variables
  let x = offscreen;
  let y = offscreen;

  const getY = (max: number, height: number, diff: number, value: number) =>
    parseFloat((height - (value * height) / max + diff).toFixed(2));

  const defaultFetch = (entry: SparklineEntry) => entry.value;

  return {
    view: ({
      attrs: {
        entries,
        width: svgWidth,
        height: svgHeight,
        strokeWidth,
        options = {},
      },
    }) => {
      if (entries.length <= 1) {
        return;
      }

      const {
        onmousemove,
        onmouseout,
        interactive = onmousemove ? false : true,
        spotRadius = 2,
        cursorWidth = 2,
        fetch = defaultFetch,
      } = options;
      const spotDiameter = spotRadius * 2;

      // Retrieve only values, easing the find for the maximum value.
      const values = (
        typeof entries[0] === 'number'
          ? entries
          : entries.map((entry) => fetch(entry as any))
      ) as number[];

      // The rendering width will account for the spot size.
      const width = svgWidth - spotDiameter * 2;

      // The rendering height accounts for stroke width and spot size.
      const height = svgHeight - strokeWidth * 2 - spotDiameter;

      // The maximum value. This is used to calculate the Y coord of each sparkline datapoint.
      const max = Math.max(...values);

      // Cache the last item index.
      const lastItemIndex = values.length - 1;

      // Calculate the X coord base step.
      const stepSizeX = width / lastItemIndex;

      // Hold all datapoints, which is whatever we got as the entry plus x/y coords and the index.
      const datapoints = values.map((v, index) => ({
        data: entries[index],
        index,
        x: index * stepSizeX + spotDiameter,
        y: getY(max, height, strokeWidth + spotRadius, v),
      }));

      // Hold the line coordinates.
      const pathY = getY(max, height, strokeWidth + spotRadius, values[0]);
      const pathCoords =
        `M${spotDiameter} ${pathY} ` +
        datapoints.map((d) => `L ${d.x} ${d.y}`).join(' ');

      const fillCoords = `${pathCoords} V ${svgHeight} L ${spotDiameter} ${svgHeight} Z`;

      return m(
        'svg',
        { width: svgWidth, height: svgHeight, style: 'fill: black' },
        [
          m('path.sparkline--fill[stroke=none]', { d: fillCoords }),
          m('path.sparkline--line[fill=none]', { d: pathCoords }),
          interactive && [
            m(`line.sparkline--cursor[stroke-width=${cursorWidth}]`, {
              x1: x,
              x2: x,
              y1: 0,
              y2: svgHeight,
            }),
            m('circle.sparkline--spot', { cx: x, cy: y, r: spotRadius }),
            m('rect.sparkline--interaction-layer', {
              style: 'fill: transparent; stroke: transparent',
              width: svgWidth,
              height: svgHeight,
              onmouseout: (event: MouseEvent) => {
                x = y = offscreen;
                onmouseout && onmouseout(event);
              },
              onmousemove: (event: MouseEvent) => {
                const mouseX = event.offsetX;
                const halfStep = stepSizeX / 2;
                const currentDataPoint =
                  datapoints.find((d) => Math.abs(d.x - mouseX) <= halfStep) ||
                  datapoints[lastItemIndex];

                x = currentDataPoint.x;
                y = currentDataPoint.y;

                onmousemove && onmousemove(event, currentDataPoint);
              },
            }),
          ],
        ],
      );
    },
  };
};

export default Sparkline;
