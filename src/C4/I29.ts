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

