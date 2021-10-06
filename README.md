# mithril-sparkline

Generate SVG sparklines with Mithril. Based on [SVG sparklines by fnando](https://github.com/fnando/sparkline), but converted to a TypeScript-based Mithril component.

## Installation

This lib is available as a NPM package. To install it, use the following command:

```bash
npm install mithril-sparkline --save
```

If you're using PNPM (and you should):

```bash
pnpm install mithril-sparkline
```

## API

### Sparkline

This package exposes a [Mithril](https://mithril.js.org/) component, `Sparkline`, which can be used as any other component. It has the following attributes:

- entries: Array of numbers, or Array<{ value: number }>.
  Alternatively, you can use your own datatype and specify `options.fetch`.
- width: number; Width of the SVG.
- height: number; Height of the SVG.
- strokeWidth: number.
- options: SparklineOptions (see below).

```ts
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
   * Define the size of the spot area (circle highlighting the selected point).
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
```

## Usage

This is the minimum working example:

```ts
import { Sparkline } from './sparkline'

const app = {
  view: () => [
    m(Sparkline, { entries: [1, 5, 2, 4, 8, 3, 7], width: 300, height: 50 }),
  ],
}

m.mount(document.body, app);
```

You can change the colours by using CSS, like the following:

```css
/* just the line */
.sparkline {
  stroke: red;
  fill: none;
}

/* line with highlight area */
.sparkline {
  stroke: red;
  fill: rgba(255, 0, 0, .3);
}

/* change the spot color */
.sparkline--spot {
  stroke: blue;
  fill: blue;
}

/* change the cursor color */
.sparkline--cursor {
  stroke: orange;
}

/* style fill area and line colors using specific class name */
.sparkline--fill {
  fill: rgba(255, 0, 0, .3);
}

.sparkline--line {
  stroke: red;
}
```
