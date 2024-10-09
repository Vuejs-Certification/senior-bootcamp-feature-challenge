<script setup>
defineProps({
  avatar: String,
  name: String,
  phone: String,
  id: String,
  active: Boolean,
});
</script>

<template>
  <div @click="select" class="contact-item" data-test="contact-item">
    <div class="flex-shrink-0">
      <img class="w-10 h-10 rounded-full" :src="avatar" alt="Avatar" />
    </div>
    <div class="ml-3">
      <p class="text-sm font-medium text-gray-900">{{ name }}</p>
      <p class="text-xs text-gray-500">Phone: {{ phone }}</p>
    </div>
  </div>
</template>
