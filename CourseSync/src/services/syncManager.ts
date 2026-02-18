import { dbService } from './db';
import { canvasService } from './canvas';
import { googleCalendarService } from './googleCalendar';
import { useStore } from '../store/useStore';

export const syncManager = {
    async syncCanvas() {
        try {
            // 1. Fetch Courses
            const courses = await canvasService.fetchCourses();

            // Transform needed for DB schema if raw data differs significantly
            const transformedCourses = courses.map((c: any) => ({
                id: c.id.toString(),
                canvas_id: c.id.toString(),
                name: c.name,
                code: c.course_code,
                term: c.term?.name,
                color: null, // Canvas doesn't always provide color via API, might need separate call or random assignment
                current_grade: c.enrollments?.[0]?.computed_current_score,
                grading_scheme: null, // fetch separately if needed
                syllabus_body: c.syllabus_body
            }));

            await dbService.saveCourses(transformedCourses);

            // 2. Fetch Assignments for each course
            for (const course of transformedCourses) {
                const assignments = await canvasService.fetchAssignments(course.id);

                const transformedAssignments = assignments.map((a: any) => ({
                    id: a.id.toString(),
                    canvas_id: a.id.toString(),
                    course_id: course.id,
                    name: a.name,
                    description: a.description,
                    due_at: a.due_at ? new Date(a.due_at).getTime() : null,
                    points_possible: a.points_possible,
                    submission_types: a.submission_types,
                    status: 'upcoming', // Logic needed to compare due date vs submission
                    html_url: a.html_url
                }));

                await dbService.saveAssignments(transformedAssignments);
            }

        } catch (error) {
            console.error('Canvas sync failed', error);
            throw error;
        }
    },

    async syncGoogleCalendar() {
        // TODO: Implement Google Calendar sync logic
        // Fetch events -> transform -> save to DB
        console.log('Google Calendar sync not fully implemented yet');
    },

    async performFullSync() {
        const { setSyncStatus, setLastSyncTime } = useStore.getState();

        if (useStore.getState().isSyncing) return;

        setSyncStatus(true);
        try {
            await Promise.allSettled([
                this.syncCanvas(),
                this.syncGoogleCalendar()
            ]);
            setLastSyncTime(Date.now());
        } catch (error) {
            console.error('Full sync failed', error);
        } finally {
            setSyncStatus(false);
        }
    }
};
