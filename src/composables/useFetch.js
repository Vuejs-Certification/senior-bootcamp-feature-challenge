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

  return {
    isFetching,
    isFinished,
    data,
    execute,
  };
}
