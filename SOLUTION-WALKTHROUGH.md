# Contact List — a walkthrough of the solution

> This is the write-up for the `solution` branch. It's meant to be read out loud to candidates, or handed to them after they've attempted the challenge. The code snippets below are exactly what's implemented in `src/composables/` on this branch.

## So what are we building?

It's a little **Contact List** app. You've got a search box at the top and a scrollable list of contact cards underneath. As you type, the list filters. There's a small but nice touch: the icon next to the search box flips between a **magnifying glass** (idle) and a **clock** (a request is in flight), so the user always knows when something's loading.

Under the hood it's Vue 3.5 with the Composition API and `<script setup>`, Vite for the dev server, Vitest for grading, and Tailwind for styling. The "backend" is faked — there's a Vite middleware in `vite.config.js` that answers `/contact-list?keyword=…`, runs a fuse.js search over 100 randomly-generated contacts, and waits 200ms before replying so you can actually see the loading state.

Here's the important part for candidates: **almost everything is already written for you.** `App.vue`, the components, the mock API, the tests — all done. The entire exam comes down to filling in **two composables**:

- `src/composables/useRefDebounced.js` — a debounced, read-only ref
- `src/composables/useFetch.js` — reactive data fetching

And there are a couple of ground rules: don't touch `App.vue`, keep the `data-test` attributes intact, and TypeScript is optional. The file `tests/app.test.js` is the grader — it spells out exactly what behavior is expected.

To see how the pieces plug together, here's the relevant bit of `App.vue` (which you're *given*, not asked to write):

```js
const keyword = ref("");
const debouncedKeyword = useRefDebounced(keyword, 200);

const { data, isFetching } = useFetch(
  () => `/contact-list?keyword=${debouncedKeyword.value}`,
  { data: [], total: 0 }
);

const contacts = computed(() => data.value.data);
```

Read that top-to-bottom and you can already see the shape of the two composables you need. `keyword` is the raw input, `debouncedKeyword` is the slowed-down version, and `useFetch` takes a *function* that builds the URL from that debounced value. Your job is to make both of those calls behave.

---

## Part 1: `useRefDebounced` — the easy one (do this first)

Start here, because `useFetch` ends up depending on its output. The whole idea: someone hands you a ref that changes on every keystroke, and you hand back a ref that only "catches up" once the typing settles down.

Here's the full solution:

```js
import { watch, ref, readonly } from "vue";

export const useRefDebounced = (aRef, ms) => {
  const debouncedRef = ref(aRef.value);

  watch(
    aRef,
    debounce(() => {
      debouncedRef.value = aRef.value;
    }, ms)
  );

  return readonly(debouncedRef);
};

// ...a ready-made debounce() helper is already sitting in the file below this.
```

Three lines of real logic, and each one is a decision worth talking through:

**Why seed it with `ref(aRef.value)`?** Because the debounced ref has to start out holding the *current* value straight away — no waiting. The test creates the ref and immediately reads it, expecting the original value to already be there. This is the classic trap: if you reach for `watch(aRef, cb, { immediate: true })` instead, that first "immediate" run gets funneled through the debounce timer too, so for the first 200ms your ref is `undefined`. Seeding it up front sidesteps that entirely.

**Why `watch` wrapped in `debounce`?** The `watch` fires on every change to `aRef`. But we don't want to copy the value across every time — we wrap the handler in the provided `debounce`, which keeps resetting a timer. So if you type five letters quickly, the timer resets five times and the value only syncs once, 200ms after you stop. That's exactly the "type fast, fire once" behavior the challenge wants. (And notice the callback reads `aRef.value` *when the timer fires*, so it always grabs the latest value — proper trailing-edge debounce.)

**Why `readonly()`?** Because this composable is the *only* thing allowed to write to that ref — the debounce owns it. Handing back a `readonly` version means whoever consumes it can read and watch it, but can't accidentally set it and knock it out of sync. It's a small encapsulation move, but it's the kind of thing a senior reviewer looks for.

One more thing worth pointing out: the README hints at reusing the `debounce` helper that ships in the file, rather than writing your own timer logic. The solution takes that hint. No need to reinvent `setTimeout` juggling.

---

## Part 2: `useFetch` — where the senior signal lives

This is the meat of the exam. Here's the whole thing:

```js
import { ref, unref, watch, toRef } from "vue";

export function useFetch(url, defaultValue = null) {
  const data = ref(defaultValue);
  const isFetching = ref(false);
  const isFinished = ref(false);
  const reactiveUrl = toRef(url);

  function loading(isLoading) {
    isFetching.value = isLoading;
    isFinished.value = !isLoading;
  }

  function execute() {
    loading(true);
    fetch(unref(reactiveUrl.value))
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        data.value = res;
      })
      .finally(() => {
        loading(false);
      });
  }

  execute();

  watch(reactiveUrl, () => {
    execute();
  });

  return { isFetching, isFinished, data, execute };
}
```

Now let's walk the reasoning, because this is where candidates either show senior instincts or don't.

**`toRef(url)` is the single most important line.** Look back at how `App.vue` calls this: it passes a *getter function* `() => ...`. But the spec says `url` should also accept a plain string, a `ref`, or a `computed`. A junior instinct is to write a pile of `if (typeof url === 'function') ... else if (isRef(url)) ...` branches. The senior move is `toRef(url)`, which normalizes **all four shapes into one watchable ref**:

- a plain string becomes a *static* ref — it never changes, so the watcher never re-fires, so a constant URL never triggers a pointless refetch;
- a ref is handed straight back;
- a computed is already a ref, so also handed back;
- a getter function gets wrapped into a computed-backed ref that stays reactive.

That one line is why `execute()` and `watch()` can both just read `reactiveUrl` without caring what the caller originally passed. It's the same trick VueUse uses internally, and it's exactly the kind of API-design maturity a senior cert is probing for.

**Why does `data` start as `ref(defaultValue)` with a `null` default?** So there's always a defined, reactive value before the first response lands. The test passes *no* default and checks that `data.value === null` at the very start — so the default genuinely matters. Meanwhile `App.vue` passes `{ data: [], total: 0 }`, which means `data.value.data` is a real empty array on first render and the `v-for` just renders nothing instead of throwing.

**Why the little `loading()` helper?** `isFetching` and `isFinished` are two sides of the same coin, and they must never disagree. Funneling both through one function — `isFinished = !isFetching` — keeps them consistent from a single source of truth. And it's called inside `.finally()`, so the loading flags reset whether the request succeeds *or* fails. `isFetching` is what the template watches to swap that clock/magnifying-glass icon.

**Why call `execute()` immediately and *then* set up a lazy `watch`?** The spec says fire a request once, right away. So we just call `execute()` directly. Then a *non-immediate* `watch(reactiveUrl, ...)` handles every subsequent URL change. This is deliberate: if you'd used `watch(reactiveUrl, execute, { immediate: true })` instead, you'd get the initial request fired *twice*. Splitting it into "run once now, watch for changes after" is the clean way to avoid that double-fire.

**And the `.finally`?** Just makes sure the loading state clears no matter how the promise settles. Straightforward, but easy to forget.

---

## A quick note on `App.vue`

You'll notice `App.vue` ends with:

```js
const contacts = computed(() => data.value.data);
```

Plain `data.value.data`, no optional chaining. That works here precisely *because* `useFetch` now returns a real ref seeded with a sensible default, so `data.value` is always defined. In the starter/challenge version, that line had to be `data.value?.data` — the `?.` was a crutch to survive the broken stub that returned a plain `{}` instead of a ref. Once the composable is done right, the crutch isn't needed. You don't have to change `App.vue` either way; it's just a nice illustration of how a solid composable simplifies its consumer.

---

## Why this earns the "senior" label

If someone asks what this challenge is really testing, it's these instincts:

- **Normalizing a polymorphic argument** (value / ref / computed / getter) behind one clean interface with `toRef`.
- **The composables pattern** — bottling up reactive state and returning refs, keeping the component declarative.
- **`readonly()` for one-way data flow** — the composable guards its own state.
- **Thinking carefully about `watch` timing** — seeding a value vs. running immediately, and avoiding accidental double-fetches.
- **Modeling loading state as a tiny state machine** and seeding safe initial data so nothing crashes before the first response.

## Pitfalls to flag when coaching

These are the ways candidates most commonly trip:

- Returning plain values instead of **refs** — the tests read `.value` and `watch` the flags, so plain objects fail instantly.
- Letting `data` start as `{}` instead of the **`defaultValue` (null)** — the test checks for `null`.
- A debounced ref that **doesn't show its initial value immediately**, or that isn't **readonly**.
- Rolling their own debounce instead of the **provided helper**.
- A **double initial fetch** from putting `{ immediate: true }` on the watch.
- Touching `App.vue` or removing `data-test` attributes (invalidates the submission).

## Fair-game discussion points (beyond the exam scope)

The solution is intentionally scoped to the exam, but if you want to push a strong candidate further, these are honest gaps:

- No **request cancellation / latest-wins guard** — type fast enough and an older, slower response could overwrite a newer one.
- No **`.catch`** for network errors.
- `unref(reactiveUrl.value)` is **redundant** — `reactiveUrl.value` is already the unwrapped string, so `fetch(reactiveUrl.value)` alone does the same thing. Harmless, but a reviewer would notice.
