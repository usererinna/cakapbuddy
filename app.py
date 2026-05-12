from flask import Flask, render_template, request, redirect, url_for, session, send_file
import random
import sqlite3
from gtts import gTTS
from io import BytesIO

app = Flask(__name__)
app.secret_key = "cakapbuddy_secret"

# ----------------------------------------------------
# 1. DATABASE HELPER
# ----------------------------------------------------
def get_words_from_db(lang, level):
    conn = sqlite3.connect('cakapbuddy.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = "SELECT text FROM words WHERE language = ? AND level = ?"
    cursor.execute(query, (lang, level))
    
    rows = cursor.fetchall()
    conn.close()
    
    word_list = [row['text'] for row in rows]
    
    if not word_list:
        return ["Error"] # Fallback if DB is empty
        
    return word_list

# ----------------------------------------------------
# 2. AUDIO PROXY (Malay Voice)
# ----------------------------------------------------
@app.route('/get_audio')
def get_audio():
    text = request.args.get('text', '')
    lang = request.args.get('lang', 'english')

    google_lang = 'ms' if lang == 'malay' else 'en'
    
    if not text:
        return "No text", 400

    tts = gTTS(text=text, lang=google_lang)
    fp = BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    
    return send_file(fp, mimetype='audio/mpeg')

# ----------------------------------------------------
# 3. SCORING & LOGIC
# ----------------------------------------------------
QUESTION_LIMITS = { "easy": 5, "medium": 10, "hard": 15 }

FEEDBACK_TEXT = {
    "english": { "perfect": "Perfect!", "good": "Good job!", "bad": "Try again." },
    "malay": { "perfect": "Tepat!", "good": "Bagus!", "bad": "Cuba lagi." }
}

def calculate_score(transcript, target, lang):
    clean_transcript = transcript.lower().strip()
    clean_target = target.lower().strip()

    if clean_transcript == clean_target:
        return 100, FEEDBACK_TEXT[lang]["perfect"]
    elif clean_target in clean_transcript:
        return 80, FEEDBACK_TEXT[lang]["good"]
    else:
        return 40, FEEDBACK_TEXT[lang]["bad"]

# ----------------------------------------------------
# 4. PAGE ROUTES
# ----------------------------------------------------

@app.route('/')
def welcome():
    # FIXED: Changed from welcome.html to index.html to match your file list
    return render_template("index.html")

@app.route('/language')
def language():
    # FIXED: Added missing route to show the language selection page
    return render_template("language.html")

@app.route('/set_language/<selected>')
def set_language(selected):
    session["lang"] = selected
    return redirect(url_for("mode_select"))

@app.route('/mode')
def mode_select():
    lang = session.get("lang", "english")
    return render_template("mode.html", lang=lang)

@app.route('/select_level/<mode_name>')
def select_level(mode_name):
    session["target_mode"] = mode_name 
    lang = session.get("lang", "english")
    return render_template("level.html", lang=lang)

@app.route('/set_level/<level_name>')
def set_level(level_name):
    lang = session.get("lang", "english")
    session["level"] = level_name

    # 🔥 CLEAR OLD SESSION DATA
    session.pop("quiz_words", None)
    session.pop("quiz_results", None)
    session.pop("quiz_current_index", None)
    session.pop("quiz_total", None)

    limit = QUESTION_LIMITS.get(level_name, 5)
    available_words = get_words_from_db(lang, level_name)
    
    count = min(len(available_words), limit)
    session["quiz_words"] = random.sample(available_words, count)
    session["quiz_total"] = count
    session["quiz_current_index"] = 0
    session["quiz_results"] = [] 
    
    target = session.get("target_mode", "practice")
    return redirect(url_for(target))
@app.route('/test')
def test():
    lang = session.get("lang", "english")
    words = session.get("quiz_words", [])
    index = session.get("quiz_current_index", 0)
    total = session.get("quiz_total", 5)

    if index >= total:
        return redirect(url_for('final_report'))

    current_word = words[index]
    return render_template("test.html", lang=lang, target_word=current_word, current_q=index+1, total_q=total)

@app.route('/practice')
def practice():
    lang = session.get("lang", "english")
    level = session.get("level", "easy")
    
    available_words = get_words_from_db(lang, level)
    word = random.choice(available_words)
    
    return render_template("practice.html", lang=lang, target_word=word, level=level)

@app.route('/result', methods=['POST'])
def result():
    lang = session.get("lang", "english")    
    transcript = request.form.get("transcript", "...")
    target = request.form.get("target_word", "")
    mode = session.get("target_mode", "practice")

    score, feedback = calculate_score(transcript, target, lang)

    if mode == "test":
        result_data = {
            "word": target,
            "user_said": transcript,
            "score": score
        }
        current_results = session.get("quiz_results", [])
        current_results.append(result_data)
        session["quiz_results"] = current_results
        
        session["quiz_current_index"] += 1
        return redirect(url_for('test'))

    else:
        return render_template("result.html", score=score, feedback=feedback, target_word=target, user_said=transcript, lang=lang, is_finished=False)

@app.route('/final_report')
def final_report():
    lang = session.get("lang", "english")
    results = session.get("quiz_results", [])
    
    total_score = sum(r['score'] for r in results)
    count = len(results) if len(results) > 0 else 1
    final_percentage = int(total_score / count)
    
    return render_template("final_score.html", lang=lang, score=final_percentage, report_card=results)

if __name__ == "__main__":
    app.run(debug=True)