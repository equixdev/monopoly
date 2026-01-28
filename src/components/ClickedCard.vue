<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ICard } from '../consts.ts';

const { t } = useI18n();

const props = defineProps<{
    card: ICard;
    cardId: number;
}>();

const { card, cardId } = props;

const cardCosts = computed(() => {
    if (card.rent && card.rent[0]) {

        const baseRent = card.rent[0];
        const houseBaseCost = 50;
        const colorIndex = Math.floor(cardId / 10);
        const houseCost = houseBaseCost * (colorIndex + 1);

        return [
            baseRent,                 
            baseRent * 2,             
            ...card.rent.slice(1),
            Math.floor(card.price! / 2),
            houseCost,                 
            houseCost * 5             
        ];
    }
});
</script>

<template>
    <div class="flex flex-col items-center gap-1 bg-white p-3 leading-tight text-black">
        <div class="border border-black flex flex-col items-center w-60 p-2 gap-2">
            <h2 class="w-full font-semibold p-2 text-center uppercase border border-black text-[18px]"
                :style="{ background: card.color }">
                <div class="text-[10px] uppercase">{{ t('titleDeed') }}</div>
                {{ t(cardId) }}
            </h2>
            <div class="font-light w-full leading-normal">
                <div v-for="(cost, index) in cardCosts" :key="index" class="flex justify-between">
                    <p>{{ t(`cardLabels.${index}`) }}</p>
                    <p>${{ cost }}</p>
                </div>
            </div>
        </div>
    </div>
</template>