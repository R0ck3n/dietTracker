PRAGMA foreign_keys = ON;

-- =========================
-- USER
-- =========================

CREATE TABLE User (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- JOURNAL QUOTIDIEN
-- 1 entrée par jour
-- =========================

CREATE TABLE Journal (
    JournalID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,

    Date DATE NOT NULL,

    Weight REAL,

    HydrationLiters REAL,

    Notes TEXT,

    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (UserID)
        REFERENCES User(UserID)
        ON DELETE CASCADE,

    UNIQUE(UserID, Date)
);

CREATE INDEX idx_journal_user_date
ON Journal(UserID, Date);

-- =========================
-- ALIMENTS CONSOMMÉS
-- =========================

CREATE TABLE FoodEntry (
    FoodEntryID INTEGER PRIMARY KEY AUTOINCREMENT,

    JournalID INTEGER NOT NULL,

    FoodName TEXT NOT NULL,

    WeightGrams REAL NOT NULL,

    CaloriesPer100g REAL NOT NULL,

    Unit TEXT NOT NULL DEFAULT 'g' CHECK (Unit IN ('g', 'ml')),

    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (JournalID)
        REFERENCES Journal(JournalID)
        ON DELETE CASCADE
);

CREATE INDEX idx_foodentry_journal
ON FoodEntry(JournalID);

-- =========================
-- ACTIVITÉS SPORTIVES
-- =========================

CREATE TABLE SportActivity (
    SportActivityID INTEGER PRIMARY KEY AUTOINCREMENT,

    JournalID INTEGER NOT NULL,

    ActivityName TEXT NOT NULL,

    DurationMinutes INTEGER NOT NULL,

    CaloriesBurned REAL NOT NULL,

    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (JournalID)
        REFERENCES Journal(JournalID)
        ON DELETE CASCADE
);

CREATE INDEX idx_sportactivity_journal
ON SportActivity(JournalID);

-- =========================
-- SOMMEIL
-- =========================

CREATE TABLE Sleep (
    SleepID INTEGER PRIMARY KEY AUTOINCREMENT,

    JournalID INTEGER NOT NULL UNIQUE,

    BedTime DATETIME NOT NULL,

    WakeTime DATETIME NOT NULL,

    Comment TEXT,

    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (JournalID)
        REFERENCES Journal(JournalID)
        ON DELETE CASCADE
);

-- =========================
-- INTERRUPTIONS DE SOMMEIL
-- =========================

CREATE TABLE SleepInterruption (
    SleepInterruptionID INTEGER PRIMARY KEY AUTOINCREMENT,

    SleepID INTEGER NOT NULL,

    StartTime DATETIME NOT NULL,

    EndTime DATETIME NOT NULL,

    Comment TEXT,

    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (SleepID)
        REFERENCES Sleep(SleepID)
        ON DELETE CASCADE
);

CREATE INDEX idx_sleepinterruption_sleep
ON SleepInterruption(SleepID);
