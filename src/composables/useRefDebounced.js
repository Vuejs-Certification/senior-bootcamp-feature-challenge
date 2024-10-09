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
