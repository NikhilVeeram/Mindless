import * as SQLite from 'expo-sqlite';
import { migrations } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('coursesync.db');
    }
    return db;
};

export const initDB = async () => {
    try {
        const database = await getDB();

        // Enable foreign keys
        await database.execAsync('PRAGMA foreign_keys = ON;');

        await database.withTransactionAsync(async () => {
            // Check current user_version
            // Note: user_version is a PRAGMA that stores an integer version number for the database
            const versionResult = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
            const currentVersion = versionResult?.user_version || 0;

            console.log(`Current DB Version: ${currentVersion}`);

            for (let i = currentVersion; i < migrations.length; i++) {
                console.log(`Running migration ${i + 1}`);
                await database.execAsync(migrations[i]);
            }

            // Update user_version
            await database.execAsync(`PRAGMA user_version = ${migrations.length}`);
        });

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};
