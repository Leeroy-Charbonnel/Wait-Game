import { GameState } from './types';
import { addResources, saveGameState } from './core';
import { updateUI } from './ui';

let timerInterval: number | null = null;

//Setup timer-related event listeners
export function setupTimerEvents(gameState: GameState): void {
    const startButton = document.getElementById('start-session') as HTMLButtonElement;
    const cancelButton = document.getElementById('cancel-session') as HTMLButtonElement;
    const sessionOptions = document.getElementById('session-options') as HTMLElement;
    const customTimeInput = document.getElementById('custom-time-input') as HTMLElement;
    const timeButtons = document.querySelectorAll('.time-btn') as NodeListOf<HTMLButtonElement>;
    const customTimeButton = document.getElementById('custom-time') as HTMLButtonElement;
    const confirmCustomTimeButton = document.getElementById('confirm-custom-time') as HTMLButtonElement;
    const minutesInput = document.getElementById('minutes-input') as HTMLInputElement;
    
    //Start session button shows time options
    startButton.addEventListener('click', () => {
        if (!gameState.session.active) {
            startButton.classList.add('hidden');
            sessionOptions.classList.remove('hidden');
        }
    });
    
    //Time option buttons
    timeButtons.forEach(button => {
        if (button.id !== 'custom-time' && button.id !== 'confirm-custom-time') {
            button.addEventListener('click', () => {
                const minutes = parseInt(button.textContent!.split(' ')[0]);
                startFocusSession(gameState, minutes);
            });
        }
    });
    
    //Custom time button
    customTimeButton.addEventListener('click', () => {
        sessionOptions.classList.add('hidden');
        customTimeInput.classList.remove('hidden');
    });
    
    //Confirm custom time
    confirmCustomTimeButton.addEventListener('click', () => {
        const minutes = parseInt(minutesInput.value);
        if (minutes > 0 && minutes <= 120) {
            startFocusSession(gameState, minutes);
        } else {
            alert('Please enter a time between 1 and 120 minutes.');
        }
    });
    
    //Cancel session button
    cancelButton.addEventListener('click', () => {
        cancelFocusSession(gameState);
    });
    
    //If there was an active session when the page was reloaded, resume it
    if (gameState.session.active && gameState.session.targetEndTime) {
        const now = Date.now();
        if (gameState.session.targetEndTime > now) {
            //Session still ongoing
            const remainingTime = gameState.session.targetEndTime - now;
            const elapsedTime = gameState.session.duration - remainingTime;
            
            //Update session start time based on elapsed time
            gameState.session.startTime = now - elapsedTime;
            
            //Start timer with remaining duration
            startTimer(gameState, remainingTime);
            
            //Update UI for active session
            document.getElementById('start-session')?.classList.add('hidden');
            document.getElementById('session-options')?.classList.add('hidden');
            document.getElementById('custom-time-input')?.classList.add('hidden');
            document.getElementById('cancel-session')?.classList.remove('hidden');
            document.getElementById('session-info')?.classList.remove('hidden');
        } else {
            //Session should have ended, complete it now
            completeFocusSession(gameState);
        }
    }
}

//Start a focus session with a duration in minutes
export function startFocusSession(gameState: GameState, minutes: number): void {
    //Convert minutes to milliseconds
    const duration = minutes * 60 * 1000;
    const now = Date.now();
    
    //Update game state
    gameState.session.active = true;
    gameState.session.startTime = now;
    gameState.session.duration = duration;
    gameState.session.targetEndTime = now + duration;
    
    //Calculate reward (focus points per minute * minutes * multiplier)
    const reward = Math.floor(minutes * gameState.multipliers.focusPointsPerMinute);
    gameState.session.currentReward = reward;
    
    //Update UI
    document.getElementById('start-session')?.classList.add('hidden');
    document.getElementById('session-options')?.classList.add('hidden');
    document.getElementById('custom-time-input')?.classList.add('hidden');
    document.getElementById('cancel-session')?.classList.remove('hidden');
    document.getElementById('session-info')?.classList.remove('hidden');
    document.getElementById('current-reward')!.textContent = reward.toString();
    
    //Start the timer
    startTimer(gameState, duration);
    
    //Save game state
    saveGameState(gameState);
}

//Start the timer with a duration in milliseconds
function startTimer(gameState: GameState, duration: number): void {
    const timerDisplay = document.getElementById('timer-display')!;
    const endTime = Date.now() + duration;
    
    //Clear any existing interval
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }
    
    //Update timer display immediately
    updateTimerDisplay(timerDisplay, duration);
    
    //Set interval to update timer display
    timerInterval = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;
        
        if (remaining <= 0) {
            //Timer complete
            clearInterval(timerInterval as number);
            timerInterval = null;
            completeFocusSession(gameState);
        } else {
            //Update timer display
            updateTimerDisplay(timerDisplay, remaining);
        }
    }, 1000) as unknown as number;
}

//Update the timer display with remaining time
function updateTimerDisplay(display: HTMLElement, timeInMs: number): void {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    
    display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

//Complete a focus session and award resources
function completeFocusSession(gameState: GameState): void {
    if (!gameState.session.active) return;
    
    //Award focus points
    addResources(gameState, 'focusPoints', gameState.session.currentReward);
    
    //Award time tokens if unlocked
    if (gameState.multipliers.timeTokensPerMinute > 0) {
        const sessionMinutes = gameState.session.duration / 60000;
        const timeTokens = Math.floor(sessionMinutes * gameState.multipliers.timeTokensPerMinute);
        addResources(gameState, 'timeTokens', timeTokens);
    }
    
    //Update statistics
    const sessionMinutes = gameState.session.duration / 60000;
    gameState.stats.totalFocusTime += sessionMinutes;
    gameState.stats.completedSessions += 1;
    
    //Reset session
    resetSession(gameState);
    
    //Update UI
    updateUI(gameState);
    
    //Reset timer display
    document.getElementById('timer-display')!.textContent = '00:00';
    
    //Show start button
    document.getElementById('start-session')?.classList.remove('hidden');
    document.getElementById('cancel-session')?.classList.add('hidden');
    document.getElementById('session-info')?.classList.add('hidden');
    
    //Save game state
    saveGameState(gameState);
    
    //Show completion message
    alert(`Focus session complete! You earned ${gameState.session.currentReward} focus points.`);
}

//Cancel a focus session early with reduced rewards
function cancelFocusSession(gameState: GameState): void {
    if (!gameState.session.active || !gameState.session.startTime || !gameState.session.targetEndTime) return;
    
    //Calculate elapsed time
    const now = Date.now();
    const elapsedTime = now - gameState.session.startTime;
    const totalDuration = gameState.session.duration;
    const percentComplete = elapsedTime / totalDuration;
    
    //Only award resources if at least 25% complete
    if (percentComplete >= 0.25) {
        //Award partial focus points (proportional to time spent, but with a penalty)
        const partialReward = Math.floor(gameState.session.currentReward * percentComplete * 0.75);
        addResources(gameState, 'focusPoints', partialReward);
        
        //Award partial time tokens if unlocked
        if (gameState.multipliers.timeTokensPerMinute > 0) {
            const sessionMinutes = (elapsedTime / 60000);
            const timeTokens = Math.floor(sessionMinutes * gameState.multipliers.timeTokensPerMinute * 0.75);
            addResources(gameState, 'timeTokens', timeTokens);
        }
        
        //Update statistics
        const sessionMinutes = elapsedTime / 60000;
        gameState.stats.totalFocusTime += sessionMinutes;
        
        //Show partial completion message
        alert(`Session canceled. You earned ${partialReward} focus points for your partial focus time.`);
    } else {
        alert('Session canceled. You need to complete at least 25% of the session to earn rewards.');
    }
    
    //Update canceled sessions statistic
    gameState.stats.canceledSessions += 1;
    
    //Clear timer interval
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    //Reset session
    resetSession(gameState);
    
    //Update UI
    updateUI(gameState);
    
    //Reset timer display
    document.getElementById('timer-display')!.textContent = '00:00';
    
    //Show start button
    document.getElementById('start-session')?.classList.remove('hidden');
    document.getElementById('cancel-session')?.classList.add('hidden');
    document.getElementById('session-info')?.classList.add('hidden');
    
    //Save game state
    saveGameState(gameState);
}

//Reset the session state
function resetSession(gameState: GameState): void {
    gameState.session.active = false;
    gameState.session.startTime = null;
    gameState.session.targetEndTime = null;
    gameState.session.currentReward = 0;
}