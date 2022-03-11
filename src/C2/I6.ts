// Item 6: Use Your Editor to Interrogate and Explore the Type System
function getElement(elOrId: string | HTMLElement | null): HTMLElement {
  if (elOrId === null) {
    elOrId;
    return document.body;
  } if (typeof elOrId === "object") {
    return elOrId;
    // ~~~~~~~~~~~~~~ 'HTMLElement | null' is not assignable to 'HTMLElement'
  }
  const el = document.getElementById(elOrId);
  if (!el) throw new Error("Not found");
  return el;
}

const res = fetch("http://example.com");
// Right Click on fetch -> Go to Definition

//  declare function fetch(
//    input: RequestInfo, init?: RequestInit
//  ): Promise<Response>
