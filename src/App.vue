<script setup lang="ts">
import { getDice, type Player } from '@/consts';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import cards from './cards.json';
import Board from './components/Board.vue';
import Card from './components/Card.vue';
import Center from './components/Center.vue';
import ClickedCard from './components/ClickedCard.vue';
import Dice from './components/Dice.vue';
import GameState from './components/GameState.vue';
import Settings from './components/Settings.vue';

const { t } = useI18n()

const players = ref<Player[]>([
  {
    position: 0, color: 'goldenrod', money: 1500, cards: {
      1: { houses: 4 },
      3: { houses: 5 },
      11: {},
      21: {},
      31: {}
    }
  },
  {
    position: 0, color: 'green', money: 1500, cards: {}
  },
  {
    position: 0, color: 'firebrick', money: 1500, cards: {}
  },
  {
    position: 0, color: 'indigo', money: 1500, cards: {}
  },
])

const currentPlayerId = ref<number>(0)
const clickedCardId = ref<number | null>(null)
const dice1 = ref<number | null>(null)
const dice2 = ref<number | null>(null)
const canTurnBeEnded = ref(false)
const currentMessage = ref<string>('Game started!')

const currentPlayer = computed(() =>
  players.value[currentPlayerId.value]
);

const currentCard = computed(() =>
  currentPlayer.value && cards[currentPlayer.value?.position]
);

const clickedCard = computed(() => clickedCardId.value !== null ? cards[clickedCardId.value] : null)

const getCardOwner = (cardId: number) => players.value.find(player => cardId in player.cards) || null;

const canBuy = computed(() =>
  currentPlayer.value &&
  currentCard.value?.price &&
  currentPlayer.value.money >= currentCard.value.price &&
  !getCardOwner(currentPlayer.value.position)
)

const setMessage = (key: string, amount: number = 0, extraParams?: Record<string, any>) => {
  const playerNum = currentPlayerId.value + 1;
  const params: Record<string, any> = {
    player: playerNum, // Pass just the number, not "Player {n}"
    amount: amount,
    ...extraParams
  };

  currentMessage.value = t(`messages.${key}`, params);
};

const handleRent = () => {
  const player = currentPlayer.value;
  if (!player) return;

  const pos = player.position;
  const card = cards[pos];
  if (!card) return;

  if (pos === 4) {
    player.money -= 200;
    setMessage('tax.income', 200);
    return;
  }
  if (pos === 38) {
    player.money -= 100;
    setMessage('tax.luxury', 100);
    return;
  }

  if (!card.color || !card.price) return;

  const owner = getCardOwner(pos);
  if (!owner || owner === player) return;

  let rent = 0;

  if (card.color === 'black') {
    const rrCount = Object.keys(owner.cards).filter(key =>
      cards[Number(key)]?.color === 'black'
    ).length;
    rent = 25 * Math.pow(2, rrCount - 1);
  }
  else if (card.color === 'gray') {
    const utilCount = Object.keys(owner.cards).filter(key =>
      cards[Number(key)]?.color === 'gray'
    ).length;
    const diceTotal = (dice1.value || 0) + (dice2.value || 0);
    rent = diceTotal * (utilCount === 1 ? 4 : 10);
  }
  else {
    const ownedCard = owner.cards[pos];
    const houses = ownedCard?.houses || 0;

    if (houses > 0 && card.rent) {
      const rentIndex = Math.min(houses, 5);
      rent = card.rent[rentIndex] || 0;
    } else {
      const totalOfThisColor = cards.filter(c => c.color === card.color).length;
      const ownedOfThisColor = Object.keys(owner.cards).filter(key =>
        cards[parseInt(key)]?.color === card.color
      ).length;
      const hasFullSet = ownedOfThisColor === totalOfThisColor;
      rent = hasFullSet ? (card.rent?.[0] || 0) * 2 : card.rent?.[0] || 0;
    }
  }

  if (rent > 0) {
    player.money -= rent;
    owner.money += rent;

    const ownerIndex = players.value.indexOf(owner);
    const ownerNum = ownerIndex + 1; // Just the number
    setMessage('rent.paid', rent, { owner: ownerNum }); // Pass number, not string
  }
};

const rollDice = () => {
  if (currentPlayer.value) {
    const result1 = getDice();
    const result2 = getDice();
    dice1.value = result1;
    dice2.value = result2;
    const total = result1 + result2;

    if (currentPlayer.value.position + total >= 40) {
      currentPlayer.value.money += 200;
      setMessage('passedGo', 200);
    }

    const newPosition = (currentPlayer.value.position + total) % 40;
    currentPlayer.value.position = newPosition;

    const messageKey = result1 === result2 ? 'rolledAndMovedDouble' : 'rolledAndMoved';
    setMessage(messageKey, 0, {
      dice1: result1,
      dice2: result2,
      property: t(String(newPosition))
    });

    handleRent();

    if (result1 !== result2) {
      canTurnBeEnded.value = true;
    }
  }
};

const endTurn = () => {
  const playersCount = players.value.length

  currentPlayerId.value = (currentPlayerId.value + 1) % playersCount;
  canTurnBeEnded.value = false
  dice1.value = null
  dice2.value = null
  clickedCardId.value = null

  setMessage('turnStarted');
}

const buy = () => {
  const player = currentPlayer.value;
  const card = currentCard.value;

  if (!player || !card?.price) return;

  player.money -= card.price;
  player.cards[player.position] = {};
  setMessage('bought', card.price, { property: t(String(player.position)) });
}

const totalHouses = computed(() => {
  let count = 0;
  players.value.forEach(player => {
    Object.values(player.cards).forEach(card => {
      const houses = card.houses || 0;
      if (houses >= 1 && houses <= 4) {
        count += houses;
      }
    });
  });
  return 32 - count;
});

const totalHotels = computed(() => {
  let count = 0;
  players.value.forEach(player => {
    Object.values(player.cards).forEach(card => {
      if (card.houses === 5) {
        count += 1;
      }
    });
  });
  return 12 - count;
});

const formatMessage = (msg: string) => {
  return msg;
};

</script>

<template>
  <Board>
    <Card v-for="(card, index) in cards" :key="index" :index="index" :card="card" :get-card-owner="getCardOwner"
      :players="players" @card-clicked="clickedCardId = $event" />

    <Center>
      <GameState :players="players" :total-houses="totalHouses" :total-hotels="totalHotels" />

      <div class="flex flex-col items-center gap-4">
        <div class="flex flex-col items-center text-center gap-2">
          <h2 v-if="currentMessage" v-html="formatMessage(currentMessage)" />
          <div class="flex gap-2" v-if="dice1 && dice2">
            <Dice :value="dice1" />
            <Dice :value="dice2" />
          </div>
        </div>

        <ClickedCard v-if="clickedCardId !== null && clickedCard" :card-id="clickedCardId" :card="clickedCard" />

        <menu class="flex gap-2">
          <button v-if="canBuy" @click="buy()" class="text-white rounded-xl p-2 px-4" :style="{
            background: currentPlayer?.color
          }">{{ t('buy') }}</button>
          <button v-if="clickedCardId && (getCardOwner(clickedCardId) === currentPlayer)"
            class="text-white rounded-xl p-2 px-4" :style="{
              background: currentPlayer?.color
            }">
            {{ t('mortgage') }}
          </button>
          <button @click="canTurnBeEnded ? endTurn() : rollDice()" class="text-white rounded-xl p-2 px-4" :style="{
            background: currentPlayer?.color
          }">{{ canTurnBeEnded ? t('endTurn') :
            t('roll') }}</button>
        </menu>

        <menu class="flex gap-2" v-if="clickedCardId && currentPlayer && getCardOwner(clickedCardId) === currentPlayer">
          <button v-if="(currentPlayer.cards?.[clickedCardId]?.houses ?? 0) < 5" class="text-white rounded-xl p-2 px-4"
            :style="{ background: currentPlayer.color }">
            {{ t('buyHouse') }}
          </button>
          <button v-if="(currentPlayer.cards?.[clickedCardId]?.houses ?? 0) > 0" class="text-white rounded-xl p-2 px-4"
            :style="{ background: currentPlayer.color }">
            {{ t('sellHouse') }}
          </button>
        </menu>
      </div>

      <Settings />
    </Center>
  </Board>
</template>