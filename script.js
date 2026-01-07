// Game State Management
class GameState {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameStatus = 'playing'; // 'playing', 'won', 'draw'
        this.winner = null;
        this.winningCombination = null;
    }

    makeMove(index) {
        if (this.board[index] !== null || this.gameStatus !== 'playing') {
            return false;
        }

        this.board[index] = this.currentPlayer;

        if (this.checkWinner()) {
            this.gameStatus = 'won';
            this.winner = this.currentPlayer;
        } else if (this.checkDraw()) {
            this.gameStatus = 'draw';
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }

        return true;
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]) {
                this.winningCombination = pattern;
                return true;
            }
        }
        return false;
    }

    checkDraw() {
        return this.board.every(cell => cell !== null);
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameStatus = 'playing';
        this.winner = null;
        this.winningCombination = null;
    }
}

// UI Controller
class UIController {
    constructor() {
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerElement = document.getElementById('current-player');
        this.gameStatusElement = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-button');
    }

    updateBoard(gameState) {
        this.cells.forEach((cell, index) => {
            const value = gameState.board[index];
            cell.textContent = value || '';
            cell.className = 'cell';

            if (value) {
                cell.classList.add(value.toLowerCase());
                cell.disabled = true;
                cell.setAttribute('aria-label', `Cell ${index + 1}, ${value}`);
            } else {
                cell.disabled = gameState.gameStatus !== 'playing';
                cell.setAttribute('aria-label', `Cell ${index + 1}, empty`);
            }
        });

        // Highlight winning combination
        if (gameState.winningCombination) {
            gameState.winningCombination.forEach(index => {
                this.cells[index].classList.add('winning');
            });
        }
    }

    updateGameStatus(gameState) {
        this.gameStatusElement.className = 'game-status';

        if (gameState.gameStatus === 'won') {
            this.gameStatusElement.textContent = `🎉 Player ${gameState.winner} Wins! 🎉`;
            this.gameStatusElement.classList.add('winner');
            this.currentPlayerElement.textContent = 'Game Over';
        } else if (gameState.gameStatus === 'draw') {
            this.gameStatusElement.textContent = "🤝 It's a Draw! 🤝";
            this.gameStatusElement.classList.add('draw');
            this.currentPlayerElement.textContent = 'Game Over';
        } else {
            this.gameStatusElement.textContent = '';
            this.currentPlayerElement.textContent = `Player ${gameState.currentPlayer}'s Turn`;
        }
    }

    showCurrentPlayer(player) {
        this.currentPlayerElement.textContent = `Player ${player}'s Turn`;
    }

    enableBoard() {
        this.cells.forEach(cell => {
            if (!cell.textContent) {
                cell.disabled = false;
            }
        });
    }

    disableBoard() {
        this.cells.forEach(cell => {
            cell.disabled = true;
        });
    }

    addCellClickListeners(callback) {
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => callback(index));
        });
    }

    addResetButtonListener(callback) {
        this.resetButton.addEventListener('click', callback);
    }
}

// Main Game Controller
class TicTacToeGame {
    constructor() {
        this.gameState = new GameState();
        this.ui = new UIController();
        this.init();
    }

    init() {
        this.ui.addCellClickListeners((index) => this.handleCellClick(index));
        this.ui.addResetButtonListener(() => this.resetGame());
        this.updateUI();

        // Add keyboard navigation
        this.addKeyboardNavigation();

        console.log('Tic Tac Toe game initialized!');
    }

    handleCellClick(index) {
        if (this.gameState.makeMove(index)) {
            this.updateUI();

            // Add click sound effect (optional)
            this.playClickSound();

            // Add haptic feedback for mobile devices
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    }

    resetGame() {
        this.gameState.reset();
        this.updateUI();

        // Focus on first cell after reset
        this.ui.cells[0].focus();

        console.log('Game reset!');
    }

    updateUI() {
        this.ui.updateBoard(this.gameState);
        this.ui.updateGameStatus(this.gameState);
    }

    addKeyboardNavigation() {
        let currentFocus = 0;

        document.addEventListener('keydown', (e) => {
            if (this.gameState.gameStatus !== 'playing') return;

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    currentFocus = (currentFocus + 1) % 9;
                    this.ui.cells[currentFocus].focus();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    currentFocus = (currentFocus - 1 + 9) % 9;
                    this.ui.cells[currentFocus].focus();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    currentFocus = (currentFocus + 3) % 9;
                    this.ui.cells[currentFocus].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    currentFocus = (currentFocus - 3 + 9) % 9;
                    this.ui.cells[currentFocus].focus();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (document.activeElement.classList.contains('cell')) {
                        const index = Array.from(this.ui.cells).indexOf(document.activeElement);
                        this.handleCellClick(index);
                    }
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    this.resetGame();
                    break;
            }
        });
    }

    playClickSound() {
        // Create a simple click sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silently fail if Web Audio API is not supported
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();

    // Make game globally accessible for debugging
    window.ticTacToeGame = game;
});

// Add some fun easter eggs
document.addEventListener('keydown', (e) => {
    // Konami code easter egg
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    if (!window.konamiSequence) window.konamiSequence = [];

    window.konamiSequence.push(e.code);
    if (window.konamiSequence.length > konamiCode.length) {
        window.konamiSequence.shift();
    }

    if (window.konamiSequence.join(',') === konamiCode.join(',')) {
        document.body.style.animation = 'rainbow 2s infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Add rainbow animation for easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);