- `useFetch` accepts a url as a string, reactive ref, computed prop, or a callback function (getter)

- `useFetch` makes a request to the API immediately upon use

- `useFetch` makes a request to the API whenever the URL changes

- `useFetch` is defined in such a way that it works with it's current use in `App.vue`

- `useRefDebounced` takes in a ref and a number of milliseconds to debounce the ref

- `useRefDebounced` returns a readonly reactive ref that syncs with the provided ref after the debounce timeout

- Given the correct implementation of `useFetch` and `useRefDebounced` the app:

- Displays the contact list when the application is initialized

- Displays the ClockIcon when the fetch request is in progress (otherwise it displays the `MagnifyingGlassIcon`)

- When the user types in the search input, the contact list has been updated and filtered by the search input

- When a keyword is typed quickly within 200 ms, the request has been triggered only once at the end of the input
