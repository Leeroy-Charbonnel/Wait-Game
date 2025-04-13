import React from 'react';
import ReactDOM from 'react-dom/client';
import { Game } from './game/Game';
import './style.css';

//Wait until DOM is loaded before initializing the game
document.addEventListener('DOMContentLoaded', () => {
  //Create container for the game
  const app = document.querySelector<HTMLDivElement>('#app');
  
  if (!app) {
    console.error('Could not find app element');
    return;
  }
  
  //Create the game instance
  const game = new Game(app);
  
  //Initialize the game
  game.init();
  
  //Start the game loop
  game.start();
  
  //Add a simple console message to indicate game has started
  console.log('Wait Game started');
});