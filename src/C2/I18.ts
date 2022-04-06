// Item 18: Use Mapped Types to Keep Values in Sync

// Suppose you’re writing a UI component for drawing scatter plots. It has a few different
// types of properties that control its display and behavior:

interface ScatterProps {
  // Data
  xs: number[],
  xy: number[],

  // Display
  xRange: [number, number],
  yRange: [number, number],
  color: string,

  // Events
  onClick: (x: number, y: number, index: number) => void,
}

// To avoid unnecessary work, you’d like to redraw the chart only when you need to.
// Changing data or display properties will require a redraw, but changing the event
// handler will not. This sort of optimization is common in React components, where
// an event handler Prop might be set to a new arrow function on every render.

// Here’s one way you might implement this optimization:

function shouldUpdate(
  oldProps: ScatterProps,
  newProps: ScatterProps,
) {
  let prop: keyof ScatterProps;
  for (prop in oldProps) {
    if (oldProps[prop] !== newProps[prop]) {
      if (prop !== "onClick") return true;
    }
  }
  return false;
}

// (See Item 54 for an explanation of the keyof declaration in this loop.)

// A “fail open” approach might look like this:

function shouldUpdateFailOpen(
  oldProps: ScatterProps,
  newProps: ScatterProps,
) {
  return (
    oldProps.xs !== newProps.xs
    || oldProps.xy !== newProps.xy
    || oldProps.xRange !== newProps.xRange
    || oldProps.yRange !== newProps.yRange
    || oldProps.color !== newProps.color
    // no check for onClick
  );
}

// With this approach there won’t be any unnecessary redraws, but there might be some
// necessary draws that get dropped. This violates the “first, do no harm” principle of
// optimization and so is less common.

// Neither approach is ideal. What you’d really like is to force your coworker or future
// self to make a decision when adding the new property. You might try adding a
// comment:

// Note: if you add a property here, update shouldUpdate!

// But do you really expect this to work? It would be better if the type checker could
// enforce this for you.

// If you set it up the right way, it can. The key is to use a mapped type and an object:

const REQUIERES_UPDATE: { [prop in keyof ScatterProps]: boolean } = {
  xs: true,
  xy: true,
  xRange: true,
  yRange: true,
  color: true,
  onClick: false,
};
