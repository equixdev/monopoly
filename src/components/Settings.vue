<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n()

const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle('dark');
};

const toggleLang = () => {
    const newLang = locale.value === 'en' ? 'ru' : 'en'
    locale.value = newLang
    localStorage.setItem('language', newLang)
}

</script>
<template>
    <menu class="flex flex-col gap-1 ml-auto">
        <button @click="toggleTheme" class="bg-black/50 text-white rounded-xl p-2 px-4">{{ t('toggleTheme') }}</button>
        <button @click="toggleLang" class="bg-black/50 text-white rounded-xl p-2 px-4">{{ t('toggleLang') }}</button>
    </menu>
</template>