const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Single game state for everyone
let gameState = {
  currentPlayerId: 0,
  clickedCardId: null,
  dice1: null,
  dice2: null,
  canTurnBeEnded: false,
  currentMessage: 'Game started!',
  players: [] // Will store socket IDs as player IDs
};

wss.on('connection', (ws) => {
  console.log('New player connected');
  
  // Send current game state to new player
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    data: gameState
  }));
  
  // Add player to list
  gameState.players.push(ws);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Update game state
      if (data.type === 'UPDATE_STATE') {
        gameState = { ...gameState, ...data.data };
        
        // Broadcast to all players
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'STATE_UPDATED',
              data: gameState
            }));
          }
        });
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Player disconnected');
    // Remove player from list
    gameState.players = gameState.players.filter(player => player !== ws);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});