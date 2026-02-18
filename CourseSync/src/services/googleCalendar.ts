import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_TOKEN_KEY = 'google_access_token';

// Placeholder Client ID
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const REDIRECT_URI = AuthSession.makeRedirectUri({
    scheme: 'coursesync',
});

// Discovery document for Google OAuth
const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const googleCalendarService = {
    async login() {
        // This requires setting up an AuthRequest with useAuthRequest hook in a component typically,
        // but can be done imperatively with AuthSession.loadAsync/promptAsync pattern or strictly imperatively
        // using AuthSession.startAsync (deprecated but simpler for non-component services) or just building URL.

        // For simplicity in this service file, we'll assume we construct the URL manually or the caller handles it.
        // However, best practice with Expo is to use the hooks in the UI. 
        // We will stub this to indicate where the token comes from.
        console.log('Google Login implementation pending UI integration via usage of useAuthRequest');
        return null;
    },

    async setToken(token: string) {
        await SecureStore.setItemAsync(GOOGLE_TOKEN_KEY, token);
    },

    async getToken() {
        return await SecureStore.getItemAsync(GOOGLE_TOKEN_KEY);
    },

    async fetchEvents(timeMin: string, timeMax: string) {
        const token = await this.getToken();
        if (!token) return [];

        try {
            // 1. List calendars
            const calendarsRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const calendars = await calendarsRes.json();

            let allEvents: any[] = [];

            // 2. Fetch events for each calendar
            for (const cal of calendars.items || []) {
                const eventsRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const events = await eventsRes.json();
                if (events.items) {
                    // Attach color/source info
                    const coloredEvents = events.items.map((e: any) => ({
                        ...e,
                        source: 'google',
                        calendarColor: cal.backgroundColor
                    }));
                    allEvents = [...allEvents, ...coloredEvents];
                }
            }
            return allEvents;
        } catch (error) {
            console.error("Error fetching Google Calendar events", error);
            return [];
        }
    }
};
