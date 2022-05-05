// Item 29: Be Liberal in What You Accept and Strict in What You Produce

// This idea is known as the robustness principle or Postel’s Law, after Jon Postel, who
// wrote it in the context of TCP:

// TCP implementations should follow a general principle of robustness: be conservative
// in what you do, be liberal in what you accept from others.

// As an example, a 3D mapping API might provide a way to position the camera and to
// calculate a viewport for a bounding box:

declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds(bounds: LngLatBounds): CameraOptions;

// It is convenient that the result of viewportForBounds can be passed directly to
// setCamera to position the camera.

// Let’s look at the definitions of these types:

interface CameraOptions {
  center?: LngLat;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}

type LngLat =
  { lng: number; lat: number; } |
  { lon: number; lat: number; } |
  [number, number];

// The fields in CameraOptions are all optional because you might want to set just the
// center or zoom without changing the bearing or pitch. The LngLat type also makes
// setCamera liberal in what it accepts: you can pass in a {lng, lat} object, a {lon,
// lat} object, or a [lng, lat] pair if you’re confident you got the order right. These
// accommodations make the function easy to call.

// The viewportForBounds function takes in another “liberal” type:

type LngLatBounds =
  { northeast: LngLat, southwest: LngLat } |
  [LngLat, LngLat] |
  [number, number, number, number];

// You can specify the bounds either using named corners, a pair of lat/lngs, or a fourtuple
// if you’re confident you got the order right. Since LngLat already accommodates
// three forms, there are no fewer than 19 possible forms for LngLatBounds. Liberal
// indeed!

// Now let’s write a function that adjusts the viewport to accommodate a GeoJSON Feature
// and stores the new viewport in the URL(for a definition of calculateBounding
// Box, see Item 31):

function focusOnFeature(f: Feature) {
  const bounds = calculateBoundingBox(f);
  const camera = viewportForBounds(bounds);
  setCamera(camera);
  const { center: { lat, lng }, zoom } = camera;
  // ~~~ Property 'lat' does not exist on type ...
  // ~~~ Property 'lng' does not exist on type ...
  zoom; // Type is number | undefined
  window.location.search = `?v=@${lat},${lng}z${zoom}`;
}

// Whoops! Only the zoom property exists, but its type is inferred as number|undefined,
// which is also problematic. The issue is that the type declaration for viewportFor
// Bounds indicates that it is liberal not just in what it accepts but also in what it produces.
// The only type-safe way to use the camera result is to introduce a code branch
// for each component of the union type (Item 22).

// The return type with lots of optional properties and union types makes viewportFor
// Bounds difficult to use. Its broad parameter type is convenient, but its broad return
// type is not. A more convenient API would be strict in what it produces.

interface LngLat { lng: number, lat: number }
type LngLatLike = LngLat | { lon: number, lat: number } | [number, number];

interface Camera {
  center: LngLat,
  zoom: number,
  bearing: number,
  pitch: number
}

interface CameraOptions extends Omit<Partial<Camera>, "center"> {
  center?: LngLatLike;
}

type LngLatBounds =
  { northeast: LngLatLike, southwest: LngLatLike } |
  [LngLatLike, LngLatLike] |
  [number, number, number, number];

declare function setCamera(camera: CameraOptions): void;
declare function viewportForBounds2(bounds: LngLatBounds): Camera;

// The loose CameraOptions type adapts the stricter Camera type (Item 14).

// Using Partial<Camera> as the parameter type in setCamera would not work here
// since you do want to allow LngLatLike objects for the center property. And you can’t
// write "CameraOptions extends Partial<Camera>" since LngLatLike is a superset of
// LngLat, not a subset (Item 7). If this seems too complicated, you could also write the
// type out explicitly at the cost of some repetition:

interface CameraOptions {
  center?: LngLatLike,
  zoom?: number,
  bearing?: number,
  pitch?: number
}

// In either case, with these new type declarations the focusOnFeature function passes
// the type checker:

function focusOnFeature(f: Feature) {
  const bounds = calculateBoundingBox(f);
  const camera = viewportForBounds2(bounds);
  setCamera(camera);
  const { center: { lat, lng }, zoom } = camera;
  zoom; // Type is number
  window.location.search = `?v=@${lat},${lng}z${zoom}`;
}

// This time the type of zoom is number, rather than number|undefined. The viewport
// ForBounds function is now much easier to use. If there were any other functions that
// produced bounds, you would also need to introduce a canonical form and a distinction
// between LngLatBounds and LngLatBoundsLike.

// Is allowing 19 possible forms of bounding box a good design? Perhaps not. But if
// you’re writing type declarations for a library that does this, you need to model its
// behavior. Just don’t have 19 return types!

// Things to Remember

// • Input types tend to be broader than output types. Optional properties and union
// types are more common in parameter types than return types.

// • To reuse types between parameters and return types, introduce a canonical form
// (for return types) and a looser form (for parameters).
