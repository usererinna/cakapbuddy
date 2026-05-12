import sqlite3

def reset_database():
    print("⏳ Connecting to database...")
    conn = sqlite3.connect('cakapbuddy.db')
    cursor = conn.cursor()

    # 1. DELETE OLD TABLE (This removes duplicates/old data)
    cursor.execute('DROP TABLE IF EXISTS words')

    # 2. CREATE TABLE
    cursor.execute('''
        CREATE TABLE words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            language TEXT NOT NULL,
            level TEXT NOT NULL
        )
    ''')

    # 3. INSERT DATA (The REAL 100+ Word List - 18 words per category)
    words_to_add = [
        # === ENGLISH : EASY (4 Years) - 18 Words ===
        ("Cat", "english", "easy"), ("Dog", "english", "easy"), ("Sun", "english", "easy"),
        ("Bus", "english", "easy"), ("Cup", "english", "easy"), ("Hat", "english", "easy"),
        ("Pen", "english", "easy"), ("Fan", "english", "easy"), ("Man", "english", "easy"),
        ("Bat", "english", "easy"), ("Box", "english", "easy"), ("Car", "english", "easy"),
        ("Bed", "english", "easy"), ("Cow", "english", "easy"), ("Fox", "english", "easy"),
        ("Pig", "english", "easy"), ("Ant", "english", "easy"), ("Bee", "english", "easy"),

        # === ENGLISH : MEDIUM (5 Years) - 18 Words ===
        ("Apple", "english", "medium"), ("Water", "english", "medium"), ("Tiger", "english", "medium"),
        ("Happy", "english", "medium"), ("Table", "english", "medium"), ("Chair", "english", "medium"),
        ("Party", "english", "medium"), ("Music", "english", "medium"), ("Zebra", "english", "medium"),
        ("Lemon", "english", "medium"), ("Rabbit", "english", "medium"), ("Panda", "english", "medium"),
        ("Garden", "english", "medium"), ("School", "english", "medium"), ("Friend", "english", "medium"),
        ("Window", "english", "medium"), ("Yellow", "english", "medium"), ("Purple", "english", "medium"),

        # === ENGLISH : HARD (6 Years) - 18 Words ===
        ("Elephant", "english", "hard"), ("Butterfly", "english", "hard"), ("Umbrella", "english", "hard"),
        ("Spaghetti", "english", "hard"), ("Dinosaur", "english", "hard"), ("Telephone", "english", "hard"),
        ("Pineapple", "english", "hard"), ("Computer", "english", "hard"), ("Hospital", "english", "hard"),
        ("Calculator", "english", "hard"), ("Strawberry", "english", "hard"), ("Vegetable", "english", "hard"),
        ("Helicopter", "english", "hard"), ("Watermelon", "english", "hard"), ("Television", "english", "hard"),
        ("Astronaut", "english", "hard"), ("Rectangle", "english", "hard"), ("Dictionary", "english", "hard"),

        # === MALAY : EASY (4 Tahun) - 18 Words ===
        ("Jus", "malay", "easy"), ("Beg", "malay", "easy"), ("Ros", "malay", "easy"),
        ("Jam", "malay", "easy"), ("Kek", "malay", "easy"), ("Van", "malay", "easy"),
        ("Pin", "malay", "easy"), ("Tin", "malay", "easy"), ("Bas", "malay", "easy"),
        ("Cat", "malay", "easy"), ("Gam", "malay", "easy"), ("Jem", "malay", "easy"),
        ("Pos", "malay", "easy"), ("Rak", "malay", "easy"), ("Sup", "malay", "easy"),
        ("Jet", "malay", "easy"), ("Zip", "malay", "easy"), ("Tin", "malay", "easy"),

        # === MALAY : MEDIUM (5 Tahun) - 18 Words ===
        ("Baju", "malay", "medium"), ("Bola", "malay", "medium"), ("Makan", "malay", "medium"),
        ("Jalan", "malay", "medium"), ("Gigi", "malay", "medium"), ("Susu", "malay", "medium"),
        ("Nasi", "malay", "medium"), ("Buku", "malay", "medium"), ("Kuda", "malay", "medium"),
        ("Lampu", "malay", "medium"), ("Meja", "malay", "medium"), ("Pintu", "malay", "medium"),
        ("Rumah", "malay", "medium"), ("Tikus", "malay", "medium"), ("Hujan", "malay", "medium"),
        ("Gajah", "malay", "medium"), ("Ayam", "malay", "medium"), ("Ikan", "malay", "medium"),

        # === MALAY : HARD (6 Tahun) - 18 Words ===
        ("Telinga", "malay", "hard"), ("Sekolah", "malay", "hard"), ("Matahari", "malay", "hard"),
        ("Keluarga", "malay", "hard"), ("Rambutan", "malay", "hard"), ("Cendawan", "malay", "hard"),
        ("Basikal", "malay", "hard"), ("Jururawat", "malay", "hard"), ("Telefon", "malay", "hard"),
        ("Komputer", "malay", "hard"), ("Angkasawan", "malay", "hard"), ("Penyu", "malay", "hard"),
        ("Cenderawan", "malay", "hard"), ("Perpustakaan", "malay", "hard"), ("Universiti", "malay", "hard"),
        ("Pancutan", "malay", "hard"), ("Kenderaan", "malay", "hard"), ("Pemandu", "malay", "hard")
    ]
    
    # 4. EXECUTE THE INSERT
    cursor.executemany('INSERT INTO words (text, language, level) VALUES (?, ?, ?)', words_to_add)

    # 5. SAVE AND CLOSE
    conn.commit()
    conn.close()
    print(f"✅ Success! Added {len(words_to_add)} words to 'cakapbuddy.db'.")

if __name__ == "__main__":
    reset_database()