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

const startNewGame = () => {
    if (confirm(t('confirmNewGame') || 'Are you sure you want to start a new game? All current progress will be lost.')) {
        // Clear the game state from localStorage
        localStorage.removeItem('monopoly_game_state');
        
        // Optionally clear other game-related storage if you have any
        // localStorage.removeItem('other_game_data');
        
        // Reload the page to apply fresh state
        window.location.reload();
    }
}
</script>

<template>
    <menu class="flex flex-col gap-1 ml-auto">
        <button @click="toggleTheme" class="bg-black/50 text-white rounded-xl p-2 px-4">{{ t('toggleTheme') }}</button>
        <button @click="toggleLang" class="bg-black/50 text-white rounded-xl p-2 px-4">{{ t('toggleLang') }}</button>
        <button @click="startNewGame" class="bg-black/50 text-white rounded-xl p-2 px-4">{{ t('newGame') }}</button>
    </menu>
</template>