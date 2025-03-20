import client from './db';

/**
 * データベーススキーマを作成する関数
 * 各テーブルの作成クエリを実行
 */
export async function createSchema() {
  try {
    // 学生テーブル
    await client.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          contact_info TEXT
        )
      `
    });

    // 高校テーブル
    await client.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS schools (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          location TEXT,
          capacity INTEGER NOT NULL
        )
      `
    });

    // 応募テーブル
    await client.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY,
          student_id INTEGER NOT NULL,
          school_id INTEGER NOT NULL,
          preference_order INTEGER NOT NULL,
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (school_id) REFERENCES schools(id),
          UNIQUE(student_id, school_id),
          UNIQUE(student_id, preference_order)
        )
      `
    });

    // 選考セッションテーブル
    await client.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS selection_sessions (
          id INTEGER PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'pending'
        )
      `
    });

    // 試験結果・マッチングテーブル
    await client.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS exam_results (
          id INTEGER PRIMARY KEY,
          session_id INTEGER NOT NULL,
          student_id INTEGER NOT NULL,
          score INTEGER NOT NULL,
          matched_school_id INTEGER,
          FOREIGN KEY (session_id) REFERENCES selection_sessions(id),
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (matched_school_id) REFERENCES schools(id)
        )
      `
    });

    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw error;
  }
}

/**
 * サンプルデータを挿入する関数
 */
export async function insertSampleData() {
  try {
    // 学生データ
    await client.execute({
      sql: `
        INSERT OR IGNORE INTO students (id, name, contact_info)
        VALUES
          (1, '山田太郎', 'yamada@example.com'),
          (2, '佐藤花子', 'sato@example.com'),
          (3, '鈴木一郎', 'suzuki@example.com'),
          (4, '田中美咲', 'tanaka@example.com'),
          (5, '高橋健太', 'takahashi@example.com'),
          (6, '伊藤さくら', 'ito@example.com'),
          (7, '渡辺雄太', 'watanabe@example.com'),
          (8, '小林明日香', 'kobayashi@example.com'),
          (9, '加藤大輔', 'kato@example.com'),
          (10, '吉田優子', 'yoshida@example.com')
      `
    });

    // 高校データ
    await client.execute({
      sql: `
        INSERT OR IGNORE INTO schools (id, name, location, capacity)
        VALUES
          (1, '第一高校', '東京都千代田区', 3),
          (2, '第二高校', '東京都新宿区', 2),
          (3, '第三高校', '東京都渋谷区', 4),
          (4, '第四高校', '東京都中野区', 3),
          (5, '第五高校', '東京都杉並区', 2)
      `
    });

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
}

/**
 * データベースを初期化する関数
 * スキーマ作成とサンプルデータ挿入を実行
 */
export async function initializeDatabase() {
  try {
    await createSchema();
    await insertSampleData();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
