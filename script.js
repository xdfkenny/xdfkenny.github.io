// File: script.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("Website loaded successfully!");

    const body = document.body;
    if (body) {
        body.style.overflowX = 'visible';
        body.style.overflowY = 'visible';
        body.style.minHeight = '100vh';

        const bodyStyles = window.getComputedStyle(body);
        const data = {
            bodyOverflowX: bodyStyles['overflow-x'],
            bodyOverflowY: bodyStyles['overflow-y'],
            bodyMinHeight: bodyStyles['min-height']
        };
        console.log(data);
    } else {
        console.error('Body element not found');
    }

    // Ensure background music plays
    const backgroundMusic = document.getElementById('background-music');
    const playButton = document.getElementById('play-music');

    if (backgroundMusic && playButton) {
        playButton.addEventListener('click', () => {
            backgroundMusic.play().catch(error => {
                console.error('Error playing background music:', error);
            });
            playButton.style.display = 'none'; // Hide the play button after playing
        });
    } else {
        console.error('Background music element or play button not found');
    }
});