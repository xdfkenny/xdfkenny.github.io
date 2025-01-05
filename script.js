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
});