<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ICard, Player } from '../consts.ts';

const { t } = useI18n()

const props = defineProps<{
  card: ICard,
  index: number,
  getCardOwner: (cardId: number) => Player | null,
  players: Player[]
}>()

const emit = defineEmits<{
  'card-clicked': [id: number]
}>()

const { getCardOwner, players, index } = props;

const handleClick = () => {
  emit('card-clicked', index);
};

const getCardClass = (index: number): string => {
  const base = "flex flex-col items-center absolute top-1/2 left-1/2 -translate-1/2";

  if (index === 0) return 'rotate-315 w-full h-full'
  if (index === 10) return 'rotate-45 w-full h-full'
  if (index === 20) return 'rotate-135 w-full h-full'
  if (index === 30) return 'rotate-225 w-full h-full'

  if (index > 10 && index < 20) {
    return `${base} rotate-90 w-[77px] h-[115px]`;
  }
  if (index > 20 && index < 30) {
    return `${base} rotate-180 w-full h-full`;
  }
  if (index > 30) {
    return `${base} rotate-270 w-[77px] h-[115px]`;
  }
  else return `${base} w-full h-full`
};

const getCardHouses = (cardId: number): number => {
  const owner = getCardOwner(cardId);
  return owner?.cards[cardId]?.houses || 0;
};

</script>

<template>
  <li class="text-center text-[10px] leading-tight relative bg-green-100 dark:bg-stone-700 border border-black" :style="{
    gridArea: `c${index}`,
  }">
    <button :class="getCardClass(index)" @click="handleClick">
      <!-- Houses -->
      <ul v-if="card.color"
        class="w-full h-7 flex justify-center gap-1 p-1 dark:opacity-50  outline outline-black items-center shrink-0"
        :style="{ backgroundColor: card.color }">
        <li v-if="getCardHouses(index) === 5" class="house bg-red-400"></li>
        <li v-else v-for="i in getCardHouses(index)" class="house bg-green-400" :key="i"></li>
      </ul>
      <div class="flex flex-col p-2 justify-evenly items-center h-full w-full">
        <!-- Property name -->
        <h2 class="uppercase leading-3 font-normal">
          {{ t(index) }}
        </h2>

        <p v-if="card.description" class="uppercase">{{ t(card.description) }}</p>

        <!-- Players on this position -->
        <ul class="flex items-center h-6 justify-center gap-1">
          <li v-for="player in players.filter(p => p.position === index)" class="h-4 w-4 rounded-full"
            :style="{ background: player.color }" :key="player.color">
          </li>
        </ul>


        <!-- Price -->
        <p v-if="card.price">${{ card.price }}</p>

        <div class="absolute -translate-x-1/2 -translate-y-full -top-[1px] left-1/2 w-2/3 h-4 rounded-t-full" :style="{
          background: getCardOwner(index)?.color || ''
        }">
        </div>
      </div>
    </button>
  </li>
</template>