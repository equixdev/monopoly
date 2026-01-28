<script setup lang="ts">
defineProps<{
    value: number
}>()
</script>

<template>
    <div class="relative w-12 h-12 bg-white rounded-xl border-2 border-gray-300 p-3">
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 rounded-full"
            :class="{ 'hidden': value !== 1 }"></div>
        <div class="absolute top-2 left-2 w-2 h-2 bg-gray-800 rounded-full"
            :class="{ 'hidden': ![2, 3, 4, 5, 6].includes(value) }"></div>
        <div class="absolute top-2 right-2 w-2 h-2 bg-gray-800 rounded-full"
            :class="{ 'hidden': ![4, 5, 6].includes(value) }"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 rounded-full"
            :class="{ 'hidden': ![3, 5].includes(value) && value !== 1 }"></div>
        <div class="absolute bottom-2 left-2 w-2 h-2 bg-gray-800 rounded-full"
            :class="{ 'hidden': ![4, 5, 6].includes(value) }"></div>
        <div class="absolute bottom-2 right-2 w-2 h-2 bg-gray-800 rounded-full"
            :class="{ 'hidden': ![2, 3, 4, 5, 6].includes(value) }"></div>
    </div>
</template>