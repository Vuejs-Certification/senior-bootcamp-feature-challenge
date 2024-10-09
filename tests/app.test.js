import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { useRefDebounced, useFetch } from "./src/composables";
import { ref, computed, watch, nextTick } from "vue";
import { setupServer, closeServer, getURL } from "./fixtures/http-server";
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

describe("useRefDebounced", () => {
  it("should work", async () => {
    const keyword = ref(1);
    const debouncedRef = useRefDebounced(keyword, 200);
    expect(debouncedRef.value).toBe(1);
    keyword.value = 2;
    expect(debouncedRef.value).toBe(1);
    await sleep(230);
    expect(debouncedRef.value).toBe(2);
    keyword.value = 1;
    expect(debouncedRef.value).toBe(2);
    await sleep(230);
    expect(debouncedRef.value).toBe(1);
  });
});

describe("useFetch", () => {
  beforeAll(async () => {
    await setupServer();
  });
  afterAll(() => {
    closeServer();
  });
  it("should work", async () => {
    const route = ref("list");
    const baseURL = getURL();
    const url = computed(() => `${baseURL}${route.value}`);
    const { data, isFetching, isFinished } = useFetch(url);

    function waitForFinished() {
      return new Promise((resolve) => {
        const stop = watch(isFinished, () => {
          stop();
          resolve();
        });
      });
    }

    expect(isFetching.value).toBe(true);
    expect(isFinished.value).toBe(false);
    expect(data.value).toBe(null);
    await waitForFinished();
    expect(isFinished.value).toBe(true);
    expect(JSON.stringify(data.value)).toBe(
      JSON.stringify({ data: [1, 2, 3, 4, 5] })
    );

    route.value = "detail";
    await nextTick();
    expect(isFetching.value).toBe(true);
    expect(isFinished.value).toBe(false);
    await waitForFinished();
    expect(JSON.stringify(data.value)).toBe(JSON.stringify({ data: "detail" }));
  });
});
