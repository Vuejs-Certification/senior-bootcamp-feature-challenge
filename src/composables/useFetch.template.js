export function useFetch(url, defaultValue = null) {
  let isFetching, isFinished, data, execute;
  return {
    isFetching,
    isFinished,
    data,
    execute,
  };
}
