<script setup lang="ts">
import type { Player } from '@/consts';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

defineProps<{
    totalHouses: number
    totalHotels: number
    players: Player[]
}>()
</script>
<template>
    <ul class="flex flex-col gap-2">
        <li v-for="(player, index) in players" :key="index" class=" relative flex items-center gap-1">
            <p class="capitalize p-2 rounded-xl text-white" :style="{ background: player.color }">{{ `${t('player')}
                ${(index + 1)}` }}
            </p>
            ${{ player.money }}
        </li>
        <div class="flex gap-2">
            <div class="house bg-green-400 h-6 w-6"></div>
            {{ totalHouses }}
        </div>
        <div class="flex gap-2">
            <div class="house bg-red-400 h-6 w-6"></div>
            {{ totalHotels }}
        </div>
    </ul>
</template>