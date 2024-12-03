const test_button = document.getElementById('test-button');
const user_text = document.getElementById('user-text');
const test_area = document.getElementById('test-area');
const timer = document.getElementById('timer');


//About page reponse
function sendMessage() {
    alert("Message Sent!")
}

async function getRandomSentence() {
    try {
        const response = await fetch('https://quoteslate.vercel.app/api/quotes/random?minLength=100&maxLength=150');
        const data = await response.json();
        console.log(data.quote)
        return data.quote;
    } catch (error) {
        console.error('Error fetching random sentence:', error);
        return "";
    }
}

// listens for user input and seperates each character by a span value
// so we can modify it to a correct letter or incorrect

let wordCount = 0;
let wordsTyped = 0;
let incorrectTotal = 0;
let timerStarted = false;

if (document.title === 'Speed Test') {
    test_area.addEventListener('input', () => {
        if (!timerStarted) {
            timerStarted = true;
            startTimer();
        }

        const arrayQuote = user_text.querySelectorAll('span')
        const arrayValue = test_area.value.split('');
        let correct = true;
        let correctCount = 0;
        wordsTyped = test_area.value.trim().split(/\s+/).length;
        arrayQuote.forEach((characterSpan, index) => {
            const character = arrayValue[index]
            if (character == null) {
                characterSpan.classList.remove('correct')
                characterSpan.classList.remove('incorrect')
                correct = false;
            }   // green input
            else if (character === characterSpan.innerText) {
                characterSpan.classList.add('correct')
                characterSpan.classList.remove('incorrect')
                correctCount++;
            } else {    // red input
                characterSpan.classList.remove('correct')
                characterSpan.classList.add('incorrect')
                correct = false;
            }
            // calculate incorrect
            if (characterSpan.classList.contains('incorrect')) {
                incorrectTotal++;
            }

            // calculate accuracy and WPM
            const accuracy = Math.round(((correctCount - incorrectTotal) / arrayQuote.length) * 100);
            updateAccuracy(accuracy);
            calculateWPM();
            incorrectDisplay(incorrectTotal);

        });
        if (correct && arrayValue.length === arrayQuote.length) {
            openModal();
            showResultsInModal();
            test_area.value = '';
            user_text.innerHTML = '';
            getNextQuote();
        }
        // Block input if incorrect
        const lastCharacter = arrayValue[arrayValue.length - 1];
        if (lastCharacter && lastCharacter !== arrayQuote[arrayValue.length - 1]?.innerText) {
            // Remove the last character if it's incorrect
            test_area.value = test_area.value.slice(0, -1);
        }

    });
}

function showResultsInModal() {
    // Calculate WPM
    const totalTimeInMinutes = (new Date() - startTime) / 60000; // Time in minutes
    const finalWPM = Math.round(wordsTyped / totalTimeInMinutes); // Words per minute calculation

    // Calculate Accuracy
    const totalCharacters = user_text.textContent.length; // Total characters in the quote
    const correctCount = wordsTyped - incorrectTotal; // Correct words
    const finalAccuracy = Math.round(((correctCount / totalCharacters) * 100)); // Accuracy in percentage

    const finalTime = getTimerTime();

    // Update Modal with Results
    document.getElementById('result-wpm').innerHTML = `WPM: ${finalWPM}`;
    document.getElementById('result-accuracy').innerHTML = `Accuracy: ${finalAccuracy}%`;
    document.getElementById('result-timer').innerHTML = `Time: ${finalTime}`;
}

function calculateWPM() {
    const totalTimeInMinutes = (new Date() - startTime) / 60000;
    const wpm = Math.round(wordsTyped / totalTimeInMinutes);
    updateWPMDisplay(wpm);
}

function updateWPMDisplay(wpm) {
    const wpmDisplay = document.getElementById('wpm');
    wpmDisplay.innerText = `WPM: ${wpm}`;
}

function incorrectDisplay(incorrectCount) {
    const incorrectChar = document.getElementById('incorrect');
    incorrectChar.innerText = `Incorrect: ${incorrectCount}`;
}

function clearIncorrectDisplay() {
    const incorrectChar = document.getElementById('incorrect');
    incorrectChar.innerText = `Incorrect: 0`;
}

function clearWPM() {
    const wpmDisplay = document.getElementById('wpm');
    wpmDisplay.innerText = `WPM: 0`;
}

function updateAccuracy(accuracy) {
    const accuracyBar = document.getElementById('accuracy-bar');
    const accuracyPercentage = document.getElementById('accuracy-percentage');

    accuracyBar.style.width = `${accuracy}%`; // Update the width of the accuracy bar
    accuracyPercentage.innerText = `Accuracy: ${accuracy}%`; // Update the percentage display

}

function clearAccuracy() {
    const accuracyBar = document.getElementById('accuracy-bar');
    const accuracyPercentage = document.getElementById('accuracy-percentage');

    accuracyBar.style.width = `0%`; // Update the width of the accuracy bar
    accuracyPercentage.innerText = `Accuracy: 0%`; // Update the percentage display
}


function getTimerTime() {
    const totalSeconds = Math.floor((new Date() - startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

}

function clearTimer() {
    timer.innerHTML = `<p style="font-size: 30px";>00:00<p>`
}

let startTime;
let timerInterval;
function startTimer() {
    startTime = new Date()
    timerInterval = setInterval(() => {
        timer.innerHTML = `<p style="font-size: 30px;">${getTimerTime()}</p>`;
    }, 1000);
}


async function getNextQuote() {
    try {
        incorrectTotal = 0;
        wordsTyped = 0;
        const quote = await getRandomSentence();
        user_text.innerHTML = '';
        quote.split('').forEach(character => {
            const characterSpan = document.createElement('span')
            characterSpan.innerText = character
            user_text.appendChild(characterSpan)
        });
        test_area.focus();
        clearAccuracy();
        clearWPM();
        clearIncorrectDisplay();
        test_area.value = '';
    }
    catch (error) {
        console.error(error);
    }
}

const openBtn = document.getElementById('openModal');
const closeBtn = document.getElementById('closeModal');
const modal = document.getElementById('modal');
function openModal() {
    modal.classList.add('open');
    clearInterval(timerInterval);
}

function resetTest() {
    timerStarted = false; // Reset the timer flag
    clearInterval(timerInterval); // Stop the timer
    test_area.value = '';
    user_text.innerHTML = '';
    incorrectTotal = 0;
    wordsTyped = 0;
    clearAccuracy();
    clearWPM();
    clearIncorrectDisplay();
}

// close modal 
if (document.title === 'Speed Test') {
    closeBtn.addEventListener("click", () => {
        modal.classList.remove('open');
        clearInterval(timerInterval);
    });
}

// blocks backspaces
if (document.title === 'Speed Test') {
    test_area.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
            event.preventDefault();
        }
    });
}

// gets next quote, clears everything
if (document.title === 'Speed Test') {
    test_button.addEventListener("click", async () => {
        resetTest();
        clearTimer();
        test_area.disabled = false;
        tip.style.display = 'none';
        await getNextQuote();
    });
}

//carousel
document.addEventListener("DOMContentLoaded", () => {
    const carouselItems = document.querySelectorAll(".carousel-item");
    const navItems = document.querySelectorAll(".carousel-nav .nav-item");
    const prevButton = document.querySelector(".carousel-btn.left");
    const nextButton = document.querySelector(".carousel-btn.right");
    
    let currentIndex = 0;

    function updateCarousel() {
        // Remove active class from all items
        carouselItems.forEach((item, index) => {
            item.classList.remove("active");
            navItems[index].classList.remove("active");
        });

        // Add active class to the current item
        carouselItems[currentIndex].classList.add("active");
        navItems[currentIndex].classList.add("active");
    }

    function showNextItem() {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarousel();
    }

    function showPrevItem() {
        currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
        updateCarousel();
    }

    prevButton.addEventListener("click", showPrevItem);
    nextButton.addEventListener("click", showNextItem);

    navItems.forEach((navItem, index) => {
        navItem.addEventListener("click", () => {
            currentIndex = index;
            updateCarousel();
        });
    });
});
