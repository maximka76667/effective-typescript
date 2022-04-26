// Item 28: Prefer Types That Always Represent Valid States

// Suppose you’re building a web application that lets you select a page, loads the content
// of that page, and then displays it. You might write the state like this:

interface PageState {
  pageText: string,
  isLoading: boolean,
  error?: string,
}

function renderPage(state: PageState) {
  if (state.error) {
    return `Error: ${state.error}`;
  } if (state.isLoading) {
    return "Loading...";
  }
  return `<p>${state.pageText}</p>`;
}

async function changePage(state: PageState, newPage: string) {
  state.isLoading = true;
  try {
    const res = await fetch(getUrlForPage(newPage));
    if (!res.ok) {
      throw new Error(`Error with loading new page. ${res.statusText}`);
    }
    const text = await res.text();
    state.isLoading = false;
    state.pageText = text;
  } catch (e) {
    state.error = `${e}`;
  }
}

// There are many problems with this! Here are a few:

// • We forgot to set state.isLoading to false in the error case.

// • We didn’t clear out state.error, so if the previous request failed, then you’ll
// keep seeing that error message instead of a loading message.

// • If the user changes pages again while the page is loading, who knows what will
// happen. They might see a new page and then an error, or the first page and not
// the second depending on the order in which the responses come back.

// The problem is that the state includes both too little information (which request
// failed? which is loading?) and too much: the State type allows both isLoading and
// error to be set, even though this represents an invalid state. This makes both
// render() and changePage() impossible to implement well.

interface RequestPending {
  state: "pending",
}

interface RequestError {
  state: "error",
  error: string,
}

interface RequestSuccess {
  state: "ok",
  pageText: string,
}

type RequestState = RequestPending | RequestError | RequestSuccess;

interface PageState2 {
  currentPage: string,
  requests: { [page: string]: RequestState }
}

// This uses a tagged union (also known as a “discriminated union”) to explicitly model
// the different states that a network request can be in. This version of the state is three
// to four times longer, but it has the enormous advantage of not admitting invalid
// states. The current page is modeled explicitly, as is the state of every request that you
// issue. As a result, the renderPage and changePage functions are easy to implement:

function renderPage2(state: PageState2) {
  const { currentPage } = state;
  const requestState = state.requests[currentPage];

  switch (requestState.state) {
    case "pending":
      return "Loading";

    case "error":
      return `Error: ${requestState.error}`;

    case "ok":
      return `<h1>${currentPage}</h1><p>${requestState.pageText}</p>`;

    default:
      break;
  }
}

async function changePage2(state: PageState2, newPage: string) {
  state.requests[newPage] = { state: "pending" };
  state.currentPage = newPage;

  try {
    const res = await fetch(getUriForPage(newPage));
    if (!res.ok) {
      throw new Error("Error");
    }
    const pageText = await res.text();
    state.requests[newPage] = { state: "ok", pageText };
  } catch (e) {
    state.requests[newPage] = { state: "error", error: `${e}` };
  }
}

// As you design your types, take care to think about which values you are including
// and which you are excluding.If you only allow values that represent valid states, your
// code will be easier to write and TypeScript will have an easier time checking it.This is
// a very general principle, and several of the other items in this chapter will cover specific
// manifestations of it.

// Things to Remember

// • Types that represent both valid and invalid states are likely to lead to confusing
// and error - prone code.

// • Prefer types that only represent valid states. Even if they are longer or harder to
// express, they will save you time and pain in the end!
