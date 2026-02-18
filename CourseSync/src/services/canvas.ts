import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useStore } from '../store/useStore';

WebBrowser.maybeCompleteAuthSession();

const CANVAS_TOKEN_KEY = 'canvas_access_token';
const CANVAS_REFRESH_TOKEN_KEY = 'canvas_refresh_token';

// Placeholder credentials - replace with real ones or inject via env vars
const CLIENT_ID = 'YOUR_CANVAS_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CANVAS_CLIENT_SECRET';
const REDIRECT_URI = AuthSession.makeRedirectUri({
    scheme: 'coursesync',
});

export const canvasService = {
    async login(domain: string) {
        const authUrl = `https://${domain}/login/oauth2/auth?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=url:GET|/api/v1/courses`;

        const result = await AuthSession.startAsync({
            authUrl,
            returnUrl: REDIRECT_URI,
        });

        if (result.type === 'success' && result.params.code) {
            // Exchange code for token
            try {
                const response = await axios.post(`https://${domain}/login/oauth2/token`, {
                    grant_type: 'authorization_code',
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    redirect_uri: REDIRECT_URI,
                    code: result.params.code,
                });

                const { access_token, refresh_token, user } = response.data;

                await SecureStore.setItemAsync(CANVAS_TOKEN_KEY, access_token);
                if (refresh_token) {
                    await SecureStore.setItemAsync(CANVAS_REFRESH_TOKEN_KEY, refresh_token);
                }

                // Update user store
                useStore.getState().setPreferences({ canvasDomain: domain });

                return user;
            } catch (error) {
                console.error('Canvas Token Exchange Failed', error);
                throw error;
            }
        } else {
            throw new Error('Canvas Login Cancelled or Failed');
        }
    },

    async getToken() {
        return await SecureStore.getItemAsync(CANVAS_TOKEN_KEY);
    },

    async fetchCourses() {
        const token = await this.getToken();
        const domain = useStore.getState().preferences.canvasDomain;
        if (!token || !domain) throw new Error('Not authenticated with Canvas');

        const response = await axios.get(`https://${domain}/api/v1/courses`, {
            params: {
                enrollment_state: 'active',
                include: ['term', 'total_scores', 'syllabus_body']
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    },

    async fetchAssignments(courseId: string) {
        const token = await this.getToken();
        const domain = useStore.getState().preferences.canvasDomain;
        if (!token || !domain) throw new Error('Not authenticated with Canvas');

        // Handle pagination if needed, for now just fetch one page
        const response = await axios.get(`https://${domain}/api/v1/courses/${courseId}/assignments`, {
            params: {
                per_page: 50,
                include: ['submission']
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    }
};
