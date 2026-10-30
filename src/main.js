import { Game } from './systems/Game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);
game.start();

// Expose game globally for debugging
window.game = game;