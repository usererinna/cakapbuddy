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
        const text = event.results[0][0].transcript;

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
        const text = event.results[0][0].transcript.toLowerCase();
        const target = wordEl.textContent.toLowerCase();
        
        if (text.includes(target)) {
            feedbackEl.textContent = bodyLang === "english" ? "Great job!" : "Bagus!";
            feedbackEl.className = "feedback-text feedback-success";
            feedbackEl.style.color = "#00bfa6";
        } else {
            feedbackEl.textContent = bodyLang === "english" ? "Try again." : "Cuba lagi.";
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