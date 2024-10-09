<!--You do not need to permanently change anything in this file.-->
<!--You can temporarily follow the instructions on lines 13 and 19 to test that the url argument for useFetch works properly.-->

<script setup>
import { ref, computed } from "vue";
import { MagnifyingGlassIcon, ClockIcon } from "@heroicons/vue/24/outline";
import ContactItem from "@/components/ContactItem.vue";
import { useFetch, useRefDebounced } from "@/composables";

const keyword = ref("");
const debouncedKeyword = useRefDebounced(keyword, 200);

// this should work
const { data, isFetching } = useFetch(
  () => `/contact-list?keyword=${debouncedKeyword.value}`,
  { data: [], total: 0 }
);

// but this should also work if you were to comment out lines 11-13
// const dynamicUrl = computed(() => `/contact-list?keyword=${debouncedKeyword.value}`);
// const { data, isFetching } = useFetch(dynamicUrl, { data: [], total: 0 });

const contacts = computed(() => data.value?.data);
</script>

<template>
  <div class="container">
    <h1>Contact List</h1>

    <div class="search-wrapper">
      <ClockIcon class="icon" v-if="isFetching" />
      <MagnifyingGlassIcon class="icon" v-else />
      <input
        type="text"
        v-model="keyword"
        class="keyword-input"
        placeholder="Search..."
      />
    </div>
    <div class="scroll-wrapper">
      <div class="h-[325px]">
        <div v-for="(contact, index) in contacts" :key="index">
          <ContactItem v-bind="contact" />
        </div>
      </div>
    </div>
  </div>
</template>
