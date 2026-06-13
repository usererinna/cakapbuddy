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
    // 🔥 INSTANT CATCHUP: True for both practice, test, and ujian pages!
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
// TEST / UJIAN PAGE HANDLERS
// ----------------------------------------
function initTestPage() {
    if (!micBtn || !recognition) return; 

    const resultBtn = document.getElementById("resultBtn");
    const transcriptInput = document.getElementById("transcriptInput");
    const feedbackEl = document.getElementById("feedback");

    micBtn.addEventListener("click", () => {
        micBtn.classList.add("listening"); 
        micBtn.innerHTML = bodyLang === 'english' ? "Listening..." : "Mendengar...";
        micBtn.disabled = true;

        if(resultBtn) resultBtn.disabled = true;

        feedbackEl.textContent = bodyLang === 'english'
            ? "Listening to you..."
            : "Sedang mendengar...";

        try { recognition.start(); } catch (e) { micBtn.disabled = false; }
    });

    recognition.onresult = (event) => {
        // 🔥 REAL-TIME STREAMING FOR TEST MODE
        let liveTranscript = '';
        let isFinalResult = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            liveTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                isFinalResult = true;
            }
        }

        // Clean up punctuation on the fly
        const text = liveTranscript.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").trim();

        // Update the feedback element and input field instantly while speaking!
        feedbackEl.textContent = bodyLang === 'english' 
            ? `You said: "${text}"` 
            : `Anda sebut: "${text}"`;
            
        if (transcriptInput) {
            transcriptInput.value = text;
        }

        // Enable the submit/result button the absolute second a final answer is recognized
        if (isFinalResult && resultBtn) {
            resultBtn.disabled = false;
            // Stop mic early if final block is settled
            recognition.stop(); 
        }
    };

    // UI resets cleanly when mic stops
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
    let hasMatched = false; 

    practiceMic.addEventListener("click", () => {
        hasMatched = false; 
        practiceMic.classList.add("listening"); 
        practiceMic.innerHTML = bodyLang === 'english' ? "Listening..." : "Mendengar...";
        practiceMic.disabled = true;

        feedbackEl.textContent = bodyLang === 'english'
            ? "Listening to you..."
            : "Sedang mendengar...";

        try { recognition.start(); } catch (e) { practiceMic.disabled = false; }
    });

    recognition.onresult = (event) => {
        if (hasMatched) return;

        let liveTranscript = '';
        let isFinalResult = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            liveTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                isFinalResult = true;
            }
        }

        const text = liveTranscript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").trim();
        const target = wordEl.textContent.toLowerCase().trim();
        const wordsSpoken = text.split(" ");
        
        feedbackEl.textContent = bodyLang === "english" 
            ? `Hearing: "${text}"...` 
            : `Mendengar: "${text}"...`;

        // INSTANT MATCH CHECK
        if (wordsSpoken.includes(target) || text === target) {
            hasMatched = true; 
            feedbackEl.textContent = bodyLang === "english" ? "Great job! ✨" : "Bagus! ✨";
            feedbackEl.className = "feedback-text feedback-success";
            feedbackEl.style.color = "#00bfa6";
            
            recognition.stop();
        } 
        // Show error only if mic finished processing and still no match
        else if (isFinalResult) {
            feedbackEl.textContent = bodyLang === "english" 
                ? `You said "${text}". Try again.` 
                : `Anda sebut "${text}". Cuba lagi.`;
            feedbackEl.className = "feedback-text feedback-error";
            feedbackEl.style.color = "#ff6b6b";
        }
    };

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
