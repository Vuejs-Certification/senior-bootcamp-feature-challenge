export function useFetch(url, defaultValue = null) {
  return {
    isFetching: false,
    isFinished: false,
    data: {},
    execute: () => {},
  };
}
