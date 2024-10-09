import { ref } from "vue";
export const useRefDebounced = (aRef, ms) => {
  // use the debounce function defined below to return a debounced ref whose value only syncs with `aRef` after `ms` milliseconds
  return ref();
};

function debounce(func, delay) {
  let timeoutId;

  return function () {
    const context = this;
    const args = arguments;

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}
