// ----------------------------------------
// PRACTICE PAGE HANDLERS
// ----------------------------------------
function initPracticePage() {
    if (!practiceMic || !recognition) return;

    const feedbackEl = document.getElementById("practiceFeedback");
    const wordEl = document.getElementById("practiceWord");

    practiceMic.addEventListener("click", () => {
        practiceMic.classList.add("listening");
        practiceMic.innerHTML = "Listening";
        practiceMic.disabled = true;

        feedbackEl.textContent = bodyLang === 'english'
            ? "Listening to you..."
            : "Sedang mendengar...";

        try {
            recognition.start();
        } catch (e) {
            practiceMic.disabled = false;
        }
    });

    recognition.onresult = (event) => {

        // User speech
        const text = event.results[0][0].transcript
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, "");

        // Target word
        const target = wordEl.textContent
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, "");

        console.log("Target:", target);
        console.log("Recognized:", text);

        // More forgiving comparison
        if (
            text === target ||
            text.includes(target) ||
            target.includes(text)
        ) {
            feedbackEl.textContent =
                bodyLang === "english" ? "Great job!" : "Bagus!";
            feedbackEl.className = "feedback-text feedback-success";
            feedbackEl.style.color = "#00bfa6";
        } else {
            feedbackEl.textContent =
                bodyLang === "english" ? "Try again." : "Cuba lagi.";
            feedbackEl.className = "feedback-text feedback-error";
            feedbackEl.style.color = "#ff6b6b";
        }

        practiceMic.classList.remove("listening");
        practiceMic.innerHTML =
            bodyLang === 'english'
                ? "🎤 Speak"
                : "🎤 Sebut";

        practiceMic.disabled = false;
    };

    recognition.onerror = () => {
        practiceMic.classList.remove("listening");
        practiceMic.innerHTML =
            bodyLang === 'english'
                ? "🎤 Speak"
                : "🎤 Sebut";

        practiceMic.disabled = false;
    };

    recognition.onend = () => {
        practiceMic.disabled = false;
    };
}
