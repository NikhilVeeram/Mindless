import { getDB } from '../db';

export const dbService = {
    // Courses
    async saveCourses(courses: any[]) {
        const db = await getDB();
        await db.withTransactionAsync(async () => {
            for (const course of courses) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO courses (id, canvas_id, name, code, term, color, current_grade, grading_scheme, syllabus_body)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        course.id,
                        course.canvas_id,
                        course.name,
                        course.code,
                        course.term,
                        course.color,
                        course.current_grade,
                        JSON.stringify(course.grading_scheme),
                        course.syllabus_body,
                    ]
                );
            }
        });
    },

    async getCourses() {
        const db = await getDB();
        return db.getAllAsync('SELECT * FROM courses ORDER BY name ASC;');
    },

    // Assignments
    async saveAssignments(assignments: any[]) {
        const db = await getDB();
        await db.withTransactionAsync(async () => {
            for (const assignment of assignments) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO assignments (id, canvas_id, course_id, name, description, due_at, points_possible, submission_types, status, html_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        assignment.id,
                        assignment.canvas_id,
                        assignment.course_id,
                        assignment.name,
                        assignment.description,
                        assignment.due_at,
                        assignment.points_possible,
                        JSON.stringify(assignment.submission_types),
                        assignment.status,
                        assignment.html_url,
                    ]
                );
            }
        });
    },

    async getAssignmentsForCourse(courseId: string) {
        const db = await getDB();
        return db.getAllAsync('SELECT * FROM assignments WHERE course_id = ? ORDER BY due_at ASC;', [courseId]);
    },

    async getUpcomingAssignments() {
        const db = await getDB();
        const now = Math.floor(Date.now() / 1000);
        return db.getAllAsync('SELECT * FROM assignments WHERE due_at > ? ORDER BY due_at ASC LIMIT 20;', [now]);
    }
};
