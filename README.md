---
difficulty: 2
tags: Code Challenge, Exercise Challenge, Vue 3
---

# Contact List

# Challenge Description

In this challenge, you are tasked with creating a `useFetch` and a `useRefDebounced` composable to power a contacts list.
This will require that you work in `src/composables/useFetch` and `src/composables/useRefDebounced`. You do NOT need to alter any code within `App.vue`.
Instead your definition of the 2 composables should work with the existing use of the composables in `App.vue`.

### useFetch Composable

1. Takes a `url` as the first argument

   - this is the URL to fetch the data from
   - it could be a plain string, a reactive ref, a computed prop, or a callback function (getter)
   - whenever the `url` changes the request should be re-run

2. Takes an optional `defaultValue` as the second argument

   - This will be the data value before the first request to the API has completed
   - This should default to null

3. The request to the API should run once immediately when using the composable

4. Returns the following values

- `data` - the data fetched from the API
- `isFetching` - a boolean ref that indicates if the data is being fetched
- `isFinished` - a boolean ref that indicates if the fetch has finished
- `execute` - a function that will fetch the data from the API

### useRefDebounced

1. Takes a reactive ref (`aRef`) as the first argument

2. Takes a number of milleseconds to debounce (`ms`) as the second argument

3. Returns a readonly reactive ref that syncs with `aRef` after the prescribed number of millseconds

> 💡 HINT: You don't have to create the debouncing logic from scratch, instead you can call the included `debounce` function to update returned ref accoridingly

## The Result

Once you've correctly implemented the composables:

- Contacts display in the list

- The ClockIcon displays next to search input while data is fetching

- The MagnifyingGlassIcon displays when no request is in progress

- When the user types in the search input, the contact list is updated and filtered by the search input

- When a keyword is typed quickly within 200 ms, the request is only triggered only once at the end of the input

![Screenshot of the solution](https://raw.githubusercontent.com/Vuejs-Certification/senior-bootcamp-feature-challenge/refs/heads/main/screenshot.gif)

## Other Considerations

- If you see the `data-test` attribute in the boilerplate don't remove it. If you remove it, your code may be invalid for the certificate.

- It is NOT necessary to have the exact same styles as in the GIF above, or even any styles at all.
