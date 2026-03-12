import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useStore } from '../store/useStore';

WebBrowser.maybeCompleteAuthSession();

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// Replace CANVAS_CLIENT_ID with the Developer Key ID you receive from TAMU admins.
// All other settings are fixed for canvas.tamu.edu.
// ─────────────────────────────────────────────────────────────────────────────

const CANVAS_DOMAIN = 'canvas.tamu.edu';
const CANVAS_CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // ← paste Client ID from TAMU admins

const CANVAS_TOKEN_KEY = 'canvas_access_token';
const CANVAS_REFRESH_KEY = 'canvas_refresh_token';

const discovery = {
    authorizationEndpoint: `https://${CANVAS_DOMAIN}/login/oauth2/auth`,
    tokenEndpoint: `https://${CANVAS_DOMAIN}/login/oauth2/token`,
};

export const canvasService = {
    /**
     * Initiates the Canvas OAuth 2.0 browser login flow.
     * Opens canvas.tamu.edu in a browser, user logs in with TAMU credentials,
     * and the app receives an access token automatically.
     */
    async loginWithOAuth() {
        const redirectUri = AuthSession.makeRedirectUri({ scheme: 'coursesync', path: 'oauth' });

        const request = new AuthSession.AuthRequest({
            clientId: CANVAS_CLIENT_ID,
            redirectUri,
            responseType: AuthSession.ResponseType.Code,
            scopes: [],
            usePKCE: false, // Canvas does not support PKCE — client_secret is used instead
            extraParams: { purpose: 'CourseSync' },
        });

        await request.makeAuthUrlAsync(discovery);
        const result = await request.promptAsync(discovery);

        if (result.type !== 'success' || !result.params.code) {
            throw new Error('Login was cancelled or failed. Please try again.');
        }

        // Exchange authorization code for access token
        const tokenResponse = await axios.post(
            `https://${CANVAS_DOMAIN}/login/oauth2/token`,
            {
                grant_type: 'authorization_code',
                client_id: CANVAS_CLIENT_ID,
                redirect_uri: redirectUri,
                code: result.params.code,
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;
        await SecureStore.setItemAsync(CANVAS_TOKEN_KEY, access_token);
        if (refresh_token) {
            await SecureStore.setItemAsync(CANVAS_REFRESH_KEY, refresh_token);
        }

        useStore.getState().setPreferences({ canvasDomain: CANVAS_DOMAIN });

        // Fetch and return user profile to confirm login
        const userResponse = await axios.get(`https://${CANVAS_DOMAIN}/api/v1/users/self`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        return userResponse.data;
    },

    async getToken() {
        return await SecureStore.getItemAsync(CANVAS_TOKEN_KEY);
    },

    async logout() {
        await SecureStore.deleteItemAsync(CANVAS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(CANVAS_REFRESH_KEY);
    },

    async fetchCourses() {
        const token = await this.getToken();
        const domain = useStore.getState().preferences.canvasDomain;
        if (!token || !domain) throw new Error('Not authenticated with Canvas');

        const response = await axios.get(`https://${domain}/api/v1/courses`, {
            params: {
                enrollment_state: 'active',
                include: ['term', 'total_scores', 'syllabus_body'],
            },
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    },

    async fetchAssignments(courseId: string) {
        const token = await this.getToken();
        const domain = useStore.getState().preferences.canvasDomain;
        if (!token || !domain) throw new Error('Not authenticated with Canvas');

        const response = await axios.get(`https://${domain}/api/v1/courses/${courseId}/assignments`, {
            params: {
                per_page: 50,
                include: ['submission'],
            },
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    },
};
