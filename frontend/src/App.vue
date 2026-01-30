<script setup lang="ts">
import { getDice, type Player, type ICard } from '@/consts';
import { computed, ref, onMounted } from 'vue';
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

// ==================== SIMPLE URL-BASED MULTIPLAYER ====================
const STORAGE_KEY = 'monopoly_game_state';

// Get player ID from URL (?id=0 or ?id=1) - Using 0-based indexing
const urlParams = new URLSearchParams(window.location.search);
const urlPlayerId = urlParams.get('id') || '0';
const internalPlayerId = parseInt(urlPlayerId) || 0;

// Initial game state
const getInitialState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    const parsed = JSON.parse(saved);
    // Ensure players array is in correct order (0, 1, 2, etc.)
    if (parsed.players && Array.isArray(parsed.players)) {
      // Sort players by id to ensure consistent indexing
      parsed.players.sort((a: Player, b: Player) => a.id - b.id);
    }
    return parsed;
  }

  // Fresh game - always use 0-based indexing
  return {
    currentPlayerId: 0, // Player 0's turn first
    dice1: null,
    dice2: null,
    canTurnBeEnded: false,
    players: [
      {
        id: 0, // Player 0
        position: 0,
        color: 'goldenrod',
        money: 1500,
        cards: { 1: { houses: 4 }, 3: { houses: 5 }, 11: {}, 21: {}, 31: {} },
        clickedCardId: null, // Per-player clicked card
      },
      {
        id: 1, // Player 1
        position: 0,
        color: 'green',
        money: 1500,
        cards: {},
        clickedCardId: null, // Per-player clicked card
      }
    ]
  };
};

// Reactive state
const gameState = ref(getInitialState());

// Save state
const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState.value));
};

// Listen for changes from other tabs
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === STORAGE_KEY && event.newValue) {
    const newState = JSON.parse(event.newValue);
    if (newState.players && Array.isArray(newState.players)) {
      newState.players.sort((a: Player, b: Player) => a.id - b.id);
    }
    gameState.value = newState;
  }
};

onMounted(() => {
  window.addEventListener('storage', handleStorageChange);
  saveState();
});

// Update state
const updateState = (newState: Partial<typeof gameState.value>) => {
  gameState.value = { ...gameState.value, ...newState };
  saveState();
};

// Update player - always access by array index for consistency
const updatePlayer = (internalId: number, playerData: Partial<Player>) => {
  const players = [...gameState.value.players];
  
  // Find player by id
  const playerIndex = players.findIndex(p => p.id === internalId);
  
  if (playerIndex !== -1) {
    players[playerIndex] = { ...players[playerIndex], ...playerData };
    updateState({ players });
  }
};

// Set clicked card for current player
const setClickedCard = (cardId: number) => {
  const playerIndex = gameState.value.players.findIndex(p => p.id === internalPlayerId);
  if (playerIndex !== -1) {
    const players = [...gameState.value.players];
    players[playerIndex] = { 
      ...players[playerIndex], 
      clickedCardId: players[playerIndex].clickedCardId === cardId ? null : cardId 
    };
    updateState({ players });
  }
};

// ==================== EXTRACTED STATE ====================
const currentPlayerId = computed(() => gameState.value.currentPlayerId);
const dice1 = computed(() => gameState.value.dice1);
const dice2 = computed(() => gameState.value.dice2);
const canTurnBeEnded = computed(() => gameState.value.canTurnBeEnded);

// Always sort players by id to ensure consistent indexing
const players = computed(() => {
  const sorted = [...gameState.value.players].sort((a, b) => a.id - b.id);
  return sorted;
});

// Current player for this tab (using array indexing)
const currentPlayer = computed(() => {
  return players.value.find(p => p.id === internalPlayerId);
});

// Display player number (0-based + 1 for display)
const displayPlayerNumber = computed(() => internalPlayerId + 1);

// Is it this player's turn?
const isMyTurn = computed(() => internalPlayerId === currentPlayerId.value);

// Display whose turn it is
const currentTurnPlayer = computed(() => currentPlayerId.value + 1);

// Current clicked card for this player
const clickedCardId = computed(() => currentPlayer.value?.clickedCardId ?? null);
const clickedCard = computed(() => clickedCardId.value !== null ? cards[clickedCardId.value] : null);

// Helper to get player color by player number (1-based)
const getPlayerColor = (playerNumber: number) => {
  // Convert to 0-based index
  const playerIndex = playerNumber - 1;
  const player = players.value.find(p => p.id === playerIndex);
  return player?.color || 'gray';
};

// ==================== GAME LOGIC ====================
const currentCard = computed(() =>
  currentPlayer.value && cards[currentPlayer.value?.position]
);

const getCardOwner = (cardId: number) => players.value.find(player => cardId in player.cards) || null;

const canBuy = computed(() =>
  currentPlayer.value &&
  currentCard.value?.price &&
  currentPlayer.value.money >= currentCard.value.price &&
  !getCardOwner(currentPlayer.value.position)
)

const handleRent = () => {
  const player = currentPlayer.value;
  if (!player) return;

  const pos = player.position;
  const card = cards[pos];
  if (!card) return;

  if (pos === 4) {
    player.money -= 200;
    updatePlayer(player.id, { money: player.money });
    return;
  }
  if (pos === 38) {
    player.money -= 100;
    updatePlayer(player.id, { money: player.money });
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

    updatePlayer(player.id, { money: player.money });
    updatePlayer(owner.id, { money: owner.money });
  }
};

const rollDice = () => {
  if (isMyTurn.value && currentPlayer.value) {
    const result1 = getDice();
    const result2 = getDice();

    updateState({
      dice1: result1,
      dice2: result2
    });

    const total = result1 + result2;

    if (currentPlayer.value.position + total >= 40) {
      currentPlayer.value.money += 200;
      updatePlayer(currentPlayer.value.id, { money: currentPlayer.value.money });
    }

    const newPosition = (currentPlayer.value.position + total) % 40;
    currentPlayer.value.position = newPosition;
    updatePlayer(currentPlayer.value.id, { position: newPosition });

    handleRent();

    if (result1 !== result2) {
      updateState({ canTurnBeEnded: true });
    }
  }
};

const endTurn = () => {
  if (isMyTurn.value) {
    const playersCount = players.value.length;
    const newPlayerId = (currentPlayerId.value + 1) % playersCount;

    updateState({
      currentPlayerId: newPlayerId,
      canTurnBeEnded: false,
      dice1: null,
      dice2: null,
    });
  }
};

const buy = () => {
  if (isMyTurn.value && currentPlayer.value) {
    const player = currentPlayer.value;
    const card = currentCard.value;

    if (!player || !card?.price) return;

    player.money -= card.price;
    player.cards[player.position] = {};

    updatePlayer(player.id, {
      money: player.money,
      cards: player.cards
    });
  }
};

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

</script>

<template>
  <Board>
    <Card 
      v-for="(card, index) in cards" 
      :key="`${index}-${players.map(p => p.position).join('-')}`" 
      :index="index" 
      :card="card" 
      :get-card-owner="getCardOwner"
      :players="players" 
      @card-clicked="setClickedCard($event)" 
    />

    <Center>
      <GameState :players="players" :total-houses="totalHouses" :total-hotels="totalHotels" />

      <div class="flex flex-col items-center gap-4">
        <div class="text-center mb-4">
          <!-- Turn indicator -->
          <div v-if="isMyTurn" class="text-lg font-semibold" :style="{ color: currentPlayer?.color }">
            {{ t('yourTurn') }}
          </div>
          <div v-else class="text-lg font-semibold" :style="{ color: getPlayerColor(currentTurnPlayer) }">
            {{ t('playerTurn', { player: currentTurnPlayer }) }}
          </div>
        </div>

        <!-- Dice -->
        <div class="flex gap-2" v-if="dice1 && dice2">
          <Dice :value="dice1" />
          <Dice :value="dice2" />
        </div>

        <!-- Selected card details (only show if this player clicked a card) -->
        <ClickedCard v-if="clickedCardId !== null && clickedCard" :card-id="clickedCardId" :card="clickedCard" />

        <!-- Controls (only show when it's this player's turn) -->
        <div v-if="isMyTurn">
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

          <!-- House controls -->
          <menu class="flex gap-2"
            v-if="clickedCardId && currentPlayer && getCardOwner(clickedCardId) === currentPlayer">
            <button v-if="(currentPlayer.cards?.[clickedCardId]?.houses ?? 0) < 5"
              class="text-white rounded-xl p-2 px-4" :style="{ background: currentPlayer.color }">
              {{ t('buyHouse') }}
            </button>
            <button v-if="(currentPlayer.cards?.[clickedCardId]?.houses ?? 0) > 0"
              class="text-white rounded-xl p-2 px-4" :style="{ background: currentPlayer.color }">
              {{ t('sellHouse') }}
            </button>
          </menu>
        </div>
      </div>

      <Settings />
    </Center>
  </Board>
</template>