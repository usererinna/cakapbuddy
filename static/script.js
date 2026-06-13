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
    // 🔥 CHANGED TO TRUE: This captures words instantly while you speak!
    recognition.interimResults = true; 
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
        micBtn.classList.add("listening"); 
        micBtn.innerHTML = "Listening to you...";
        micBtn.disabled = true;

        if(resultBtn) resultBtn.disabled = true;

        feedbackEl.textContent = bodyLang === 'english'
            ? "Listening to you..."
            : "Sedang mendengar...";

        try { recognition.start(); } catch (e) { micBtn.disabled = false; }
    });

    recognition.onresult = (event) => {
        // Build the transcript from live results
        let liveTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            liveTranscript += event.results[i][0].transcript;
        }

        const text = liveTranscript.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").trim();

        feedbackEl.textContent = `You said: "${text}"`;
        transcriptInput.value = text;

        // Enable result button once we get any final or solid input
        if(event.results[0].isFinal && resultBtn) {
            resultBtn.disabled = false;
        }
    };

    // 🔥 Reset button when the engine completely stops listening
    recognition.onend = () => { 
        micBtn.classList.remove("listening");
        micBtn.innerHTML = bodyLang === 'english'
            ? "🎤 Start Speaking"
            : "🎤 Mula Bercakap";
        micBtn.disabled = false; 
    };
}

// ----------------------------------------
// PRACTICE PAGE HANDLERS
// ----------------------------------------
function initPracticePage() {
    if (!practiceMic || !recognition) return; 

    const feedbackEl = document.getElementById("practiceFeedback");
    const wordEl = document.getElementById("practiceWord");
    let hasMatched = false; // Prevents triggering success multiple times in one go

    practiceMic.addEventListener("click", () => {
        hasMatched = false; // Reset tracking flag
        practiceMic.classList.add("listening"); 
        practiceMic.innerHTML = "Listening...";
        practiceMic.disabled = true;

        feedbackEl.textContent = bodyLang === 'english'
            ? "Listening to you..."
            : "Sedang mendengar...";

        try { recognition.start(); } catch (e) { practiceMic.disabled = false; }
    });

    recognition.onresult = (event) => {
        // If they already got it right during this turn, don't re-run logic
        if (hasMatched) return;

        // 🔥 Gather real-time text stream
        let liveTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            liveTranscript += event.results[i][0].transcript;
        }

        const text = liveTranscript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").trim();
        const target = wordEl.textContent.toLowerCase().trim();
        const wordsSpoken = text.split(" ");
        
        // Show live text update as they talk so they see it catching up fast!
        feedbackEl.textContent = bodyLang === "english" 
            ? `Hearing: "${text}"...` 
            : `Mendengar: "${text}"...`;

        // 🔥 INSTANT MATCH CHECK
        if (wordsSpoken.includes(target) || text === target) {
            hasMatched = true; // Lock it in!
            feedbackEl.textContent = bodyLang === "english" ? "Great job! ✨" : "Bagus! ✨";
            feedbackEl.className = "feedback-text feedback-success";
            feedbackEl.style.color = "#00bfa6";
            
            // Stop the mic early since they nailed it!
            recognition.stop();
        } 
        // Only show final error if the speaker completely stopped and didn't hit the target
        else if (event.results[0].isFinal) {
            feedbackEl.textContent = bodyLang === "english" 
                ? `You said "${text}". Try again.` 
                : `Anda sebut "${text}". Cuba lagi.`;
            feedbackEl.className = "feedback-text feedback-error";
            feedbackEl.style.color = "#ff6b6b";
        }
    };

    // 🔥 UI cleanup safely handled here when mic turns off
    recognition.onend = () => { 
        practiceMic.classList.remove("listening");
        practiceMic.innerHTML = bodyLang === 'english' ? "🎤 Speak" : "🎤 Sebut";
        practiceMic.disabled = false; 
    };
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
