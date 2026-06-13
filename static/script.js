// ----------------------------------------
// Speech Recognition Setup
// ----------------------------------------
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const micBtn = document.getElementById("micBtn");
const practiceMic = document.getElementById("practiceMic");
const listenPractice = document.getElementById("listenPractice");
const listenTest = document.getElementById("listenTest");

const bodyLang = document.body.getAttribute('data-lang') || 'english'; 
const speechCode = bodyLang === 'english' ? 'en-US' : 'ms-MY';

let recognition = null;

if (window.SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = speechCode; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
} else {
    alert("Speech Recognition not supported. Please use Chrome.");
}

// ----------------------------------------
// AUDIO PLAYER (Using Python Proxy)
// ----------------------------------------
function speakWord(text) {
    const lang = bodyLang; 
    console.log(`🔊 Requesting audio for: "${text}" in ${lang}`);

    const url = `/get_audio?text=${encodeURIComponent(text)}&lang=${lang}`;

    const audio = new Audio(url);
    audio.oncanplaythrough = () => {
        audio.play().catch(e => console.error("Play error:", e));
    };
    audio.onerror = (e) => {
        console.error("Audio failed. Check python terminal.", e);
        alert("Audio error! Did you run 'pip install gTTS'?");
    };
    audio.load();
}

// ----------------------------------------
// TEST PAGE HANDLERS
// ----------------------------------------
function initTestPage() {
    if (!micBtn || !recognition) return; 

    const resultBtn = document.getElementById("resultBtn");
    const transcriptInput = document.getElementById("transcriptInput");
    const feedbackEl = document.getElementById("feedback");

    micBtn.addEventListener("click", () => {
        micBtn.classList.add("listening"); // 🔥 NEW (no layout shift)
        micBtn.innerHTML = "Listening to you...";
        micBtn.disabled = true;

        if(resultBtn) resultBtn.disabled = true;

        feedbackEl.textContent = bodyLang === 'english'
            ? "Listening to you..."
            : "Sedang mendengar...";

        try { recognition.start(); } catch (e) { micBtn.disabled = false; }
    });

    recognition.onresult = (event) => {
        // Clean up punctuation from the speech recognition result
        const text = event.results[0][0].transcript.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").trim();

        feedbackEl.textContent = `You said: "${text}"`;
        transcriptInput.value = text;

        if(resultBtn) resultBtn.disabled = false;

        micBtn.classList.remove("listening"); // 🔥 NEW
        micBtn.innerHTML = bodyLang === 'english'
            ? "🎤 Start Speaking"
            : "🎤 Mula Bercakap";

        micBtn.disabled = false;
    };

    recognition.onend = () => { micBtn.disabled = false; };
}

// ----------------------------------------
// PRACTICE PAGE HANDLERS
// ----------------------------------------
function initPracticePage() {
    if (!practiceMic || !recognition) return; 

    const feedbackEl = document.getElementById("practiceFeedback");
    const wordEl = document.getElementById("practiceWord");

    practiceMic.addEventListener("click", () => {
        practiceMic.classList.add("listening"); // 🔥 NEW
        practiceMic.innerHTML = "Listening";
        practiceMic.disabled = true;

        feedbackEl.textContent = bodyLang === 'english'
            ? "Listening to you..."
            : "Sedang mendengar...";

        try { recognition.start(); } catch (e) { practiceMic.disabled = false; }
    });

    recognition.onresult = (event) => {
        // 🔥 FIX: Clean up spoken text (lowercase, remove punctuation like periods, trim spacing)
        const text = event.results[0][0].transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").trim();
        // 🔥 FIX: Clean up target word as well
        const target = wordEl.textContent.toLowerCase().trim();
        
        console.log(`Checking spoken: "${text}" against target: "${target}"`);

        // Check if the word matches directly or is included cleanly in a sentence
        const wordsSpoken = text.split(" ");
        
        if (wordsSpoken.includes(target) || text === target) {
            feedbackEl.textContent = bodyLang === "english" ? "Great job! ✨" : "Bagus! ✨";
            feedbackEl.className = "feedback-text feedback-success";
            feedbackEl.style.color = "#00bfa6";
        } else {
            // Updated to show what was actually heard to help the user adjust
            feedbackEl.textContent = bodyLang === "english" 
                ? `You said "${text}". Try again.` 
                : `Anda sebut "${text}". Cuba lagi.`;
            feedbackEl.className = "feedback-text feedback-error";
            feedbackEl.style.color = "#ff6b6b";
        }

        practiceMic.classList.remove("listening"); // 🔥 NEW
        practiceMic.innerHTML = bodyLang === 'english'
            ? "🎤 Speak"
            : "🎤 Sebut";

        practiceMic.disabled = false;
    };

    recognition.onend = () => { practiceMic.disabled = false; };
}

// ----------------------------------------
// LISTEN BUTTON EVENTS
// ----------------------------------------
if (listenPractice) {
    listenPractice.addEventListener("click", () => {
        const word = document.getElementById("practiceWord").textContent;
        speakWord(word);
    });
}

if (listenTest) {
    listenTest.addEventListener("click", () => {
        const wordEl = document.getElementById("targetWord");
        if(wordEl) speakWord(wordEl.textContent);
    });
}

// RUN
initTestPage();
initPracticePage();
