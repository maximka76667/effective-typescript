// Item 24: Be Consistent in Your Use of Aliases

// When you introduce a new name for a value:

const borough = { name: "Brooklyn", location: [40.688, -73.979] };
const loc = borough.location;

// you have created an alias. Changes to properties on the alias will be visible on the
// original value as well:

loc[0] = 0;
borough.location; // [0, -73.979]

// Aliases are the bane of compiler writers in all languages because they make control
// flow analysis difficult. If you’re deliberate in your use of aliases, TypeScript will be
// able to understand your code better and help you find more real errors.
// Suppose you have a data structure that represents a polygon:

interface Coordinate {
  x: number;
  y: number;
}

interface BoundingBox {
  x: [number, number];
  y: [number, number];
}

interface Polygon {
  exterior: Coordinate[];
  holes: Coordinate[][];
  bbox?: BoundingBox;
}

// The geometry of the polygon is specified by the exterior and holes properties. The
// bbox property is an optimization that may or may not be present. You can use it to
// speed up a point-in-polygon check:

function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  if (polygon.bbox) {
    if (pt.x < polygon.bbox.x[0] || pt.x > polygon.bbox.x[1]
      || pt.y < polygon.bbox.y[1] || pt.y > polygon.bbox.y[1]) {
      return false;
    }
  }
  // ... more complex check
}

// This code works (and type checks) but is a bit repetitive: polygon.bbox appears five
// times in three lines! Here’s an attempt to factor out an intermediate variable to reduce
// duplication:

function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const box = polygon.bbox;
  if (polygon.bbox) {
    if (pt.x < box.x[0] || pt.x > box.x[1]
      // ~~~ ~~~ Object is possibly 'undefined'
      || pt.y < box.y[1] || pt.y > box.y[1]) {
      // ~~~ ~~~ Object is possibly 'undefined'
      return false;
    }
  }
  // ...
}

// (I’m assuming you’ve enabled strictNullChecks.)
// This code still works, so why the error? By factoring out the box variable, you’ve created
// an alias for polygon.bbox, and this has thwarted the control flow analysis that
// quietly worked in the first example.
// You can inspect the types of box and polygon.bbox to see what’s happening:

function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  polygon.bbox; // Type is BoundingBox | undefined
  const box = polygon.bbox;
  box; // Type is BoundingBox | undefined
  if (polygon.bbox) {
    polygon.bbox; // Type is BoundingBox
    box; // Type is BoundingBox | undefined
  }
}

// The property check refines the type of polygon.bbox but not of box and hence the
// errors. This leads us to the golden rule of aliasing: if you introduce an alias, use it
// consistently.

// Using box in the property check fixes the error:

function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const box = polygon.bbox;
  if (box) {
    if (pt.x < box.x[0] || pt.x > box.x[1]
      || pt.y < box.y[1] || pt.y > box.y[1]) { // OK
      return false;
    }
  }
  // ...
}

// The type checker is happy now, but there’s an issue for human readers. We’re using
// two names for the same thing: box and bbox. This is a distinction without a difference
// (Item 36).
// Object destructuring syntax rewards consistent naming with a more compact syntax.
// You can even use it on arrays and nested structures:

function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
  const { bbox } = polygon;
  if (bbox) {
    const { x, y } = bbox;
    if (pt.x < x[0] || pt.x > x[1]
      || pt.y < x[0] || pt.y > y[1]) {
      return false;
    }
  }
  // ...
}

// A few other points:

// • This code would have required more property checks if the x and y properties
// had been optional, rather than the whole bbox property. We benefited from following
// the advice of Item 31, which discusses the importance of pushing null values
// to the perimeter of your types.

// • An optional property was appropriate for bbox but would not have been appropriate
// for holes. If holes was optional, then it would be possible for it to be
// either missing or an empty array ([]). This would be a distinction without a difference.
// An empty array is a fine way to indicate “no holes.”
// In your interactions with the type checker, don’t forget that aliasing can introduce
// confusion at runtime, too:

const { bbox } = polygon;
if (!bbox) {
  calculatePolygonBbox(polygon); // Fills in polygon.bbox
  // Now polygon.bbox and bbox refer to different values!
}

// TypeScript’s control flow analysis tends to be quite good for local variables. But for
// properties you should be on guard:

function fn(p: Polygon) { /* ... */ }

const polygon: Polygon = {
  exterior: [
    { x: 2, y: 5 }, { x: 5, y: 5 }, { x: 2, y: 2 }, { x: 5, y: 2 },
  ],
  holes: [],
  bbox: {
    x: [2, 5],
    y: [5, 2],
  },
};

polygon.bbox; // Type is BoundingBox | undefined
if (polygon.bbox) {
  polygon.bbox; // Type is BoundingBox
  fn(polygon);
  polygon.bbox; // Type is still BoundingBox
}

// The call to fn(polygon) could very well un-set polygon.bbox, so it would be safer for
// the type to revert to BoundingBox | undefined. But this would get frustrating: you’d
// have to repeat your property checks every time you called a function. So TypeScript
// makes the pragmatic choice to assume the function does not invalidate its type refinements.

// But it could. If you’d factored out a local bbox variable instead of using poly
// gon.bbox, the type of bbox would remain accurate, but it might no longer be the same
// value as polygon.box.

// Things to Remember

// • Aliasing can prevent TypeScript from narrowing types. If you create an alias for a
// variable, use it consistently.

// • Use destructuring syntax to encourage consistent naming.

// • Be aware of how function calls can invalidate type refinements on properties.
// Trust refinements on local variables more than on properties.
