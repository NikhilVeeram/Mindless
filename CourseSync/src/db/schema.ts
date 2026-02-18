export const migrations = [
  // Initial Schema
  `
  CREATE TABLE IF NOT EXISTS user_preferences (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY NOT NULL,
    canvas_id TEXT UNIQUE,
    name TEXT NOT NULL,
    code TEXT,
    term TEXT,
    color TEXT,
    current_grade REAL,
    grading_scheme TEXT, -- JSON string
    syllabus_body TEXT,
    is_hidden INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY NOT NULL,
    canvas_id TEXT UNIQUE,
    course_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    due_at INTEGER,
    points_possible REAL,
    submission_types TEXT, -- JSON array
    status TEXT DEFAULT 'upcoming', -- upcoming, submitted, graded, late, missing
    html_url TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS grades (
    assignment_id TEXT PRIMARY KEY NOT NULL,
    score REAL,
    grade TEXT,
    submitted_at INTEGER,
    grader_comments TEXT,
    FOREIGN KEY(assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS grading_weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id TEXT NOT NULL,
    category TEXT NOT NULL,
    weight REAL NOT NULL, -- Percentage (e.g. 40.0)
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY NOT NULL,
    source TEXT NOT NULL, -- 'canvas', 'google', 'apple', 'manual'
    external_id TEXT, -- ID from the source system
    course_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    location TEXT,
    all_day INTEGER DEFAULT 0,
    color TEXT,
    recurrence_rule TEXT,
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    metadata TEXT -- JSON context snapshot
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY NOT NULL,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY(conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
  );
  `
];
