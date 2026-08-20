import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContextObject';

// ─────────────────────────────────────────────────────────────────────────────
//  SHA-256 PURE JS (fonctionne sur HTTP et HTTPS, sans crypto.subtle)
// ─────────────────────────────────────────────────────────────────────────────
const sha256 = (() => {
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    const rotr = (n, x) => (x >>> n) | (x << (32 - n));
    const σ0 = x => rotr(2, x) ^ rotr(13, x) ^ rotr(22, x);
    const σ1 = x => rotr(6, x) ^ rotr(11, x) ^ rotr(25, x);
    const γ0 = x => rotr(7, x) ^ rotr(18, x) ^ (x >>> 3);
    const γ1 = x => rotr(17, x) ^ rotr(19, x) ^ (x >>> 10);

    return (str) => {
        const bytes = new TextEncoder().encode(str);
        const bits = bytes.length * 8;
        // Padding
        const padded = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64);
        padded.set(bytes);
        padded[bytes.length] = 0x80;
        const view = new DataView(padded.buffer);
        view.setUint32(padded.length - 4, bits >>> 0, false);
        view.setUint32(padded.length - 8, Math.floor(bits / 2 ** 32), false);

        let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
        let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

        for (let i = 0; i < padded.length; i += 64) {
            const w = new Array(64);
            for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4, false);
            for (let j = 16; j < 64; j++)
                w[j] = (γ1(w[j - 2]) + w[j - 7] + γ0(w[j - 15]) + w[j - 16]) >>> 0;

            let [a, b, c, d, e, f, g, h] = [h0, h1, h2, h3, h4, h5, h6, h7];
            for (let j = 0; j < 64; j++) {
                const T1 = (h + σ1(e) + ((e & f) ^ (~e & g)) + K[j] + w[j]) >>> 0;
                const T2 = (σ0(a) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
                [h, g, f, e, d, c, b, a] = [g, f, e, (d + T1) >>> 0, c, b, a, (T1 + T2) >>> 0];
            }
            h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
            h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
        }
        return [h0, h1, h2, h3, h4, h5, h6, h7]
            .map(n => n.toString(16).padStart(8, '0')).join('');
    };
})();

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIGURATION DE SÉCURITÉ
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_USERNAME = 'admin';
// Hash SHA-256 de : bambous@2026
const ADMIN_PASSWORD_HASH = 'd364174e4b80e18dc7c4abca5be8a882c07ce4769211de09c92cfaf73024c0f2';

const AUTH_TOKEN_KEY = 'bambous_session_token';
const AUTH_EXPIRY_KEY = 'bambous_session_expiry';
const AUTH_SIGN_KEY = 'bambous_session_sign';
const LOCKOUT_KEY = 'bambous_lockout';
const ATTEMPTS_KEY = 'bambous_attempts';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60000;  // 30 minutes
const SESSION_DURATION = 8 * 3600000; // 8 heures

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITAIRES SESSION
// ─────────────────────────────────────────────────────────────────────────────

const generateSessionToken = () => {
    try {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
        // Fallback si crypto.getRandomValues indisponible
        return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
};

const signToken = (token, expiry) => sha256(`${token}:${expiry}:${navigator.userAgent}`);

// ─────────────────────────────────────────────────────────────────────────────
//  VERROUILLAGE
// ─────────────────────────────────────────────────────────────────────────────

const getLockoutInfo = () => {
    try {
        return {
            lockoutUntil: parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10),
            attempts: parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10),
        };
    } catch { return { lockoutUntil: 0, attempts: 0 }; }
};

const isLockedOut = () => Date.now() < getLockoutInfo().lockoutUntil;

const getRemainingLockoutSeconds = () =>
    Math.max(0, Math.ceil((getLockoutInfo().lockoutUntil - Date.now()) / 1000));

const recordFailedAttempt = () => {
    const { attempts } = getLockoutInfo();
    const next = attempts + 1;
    localStorage.setItem(ATTEMPTS_KEY, String(next));
    if (next >= MAX_ATTEMPTS) {
        localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_DURATION));
        localStorage.setItem(ATTEMPTS_KEY, '0');
    }
    return next;
};

const resetAttempts = () => {
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SESSION
// ─────────────────────────────────────────────────────────────────────────────

const clearSession = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    localStorage.removeItem(AUTH_SIGN_KEY);
};

const isSessionValid = () => {
    try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
        const sign = localStorage.getItem(AUTH_SIGN_KEY);
        if (!token || !expiry || !sign) return false;
        if (Date.now() > parseInt(expiry, 10)) { clearSession(); return false; }
        const expected = signToken(token, expiry);
        if (sign !== expected) { clearSession(); return false; }
        return true;
    } catch { clearSession(); return false; }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(() => isSessionValid());

    // Revalidation périodique toutes les 5 min
    useEffect(() => {
        if (!isAdmin) return;
        const id = setInterval(() => {
            if (!isSessionValid()) setIsAdmin(false);
        }, 5 * 60000);
        return () => clearInterval(id);
    }, [isAdmin]);

    /**
     * login() — synchrone (sha256 pur JS, pas de Promise)
     */
    const login = useCallback((username, password) => {
        // 1. Vérifier le verrouillage
        if (isLockedOut()) {
            const mins = Math.ceil(getRemainingLockoutSeconds() / 60);
            return { success: false, message: `Trop de tentatives. Réessayez dans ${mins} minute(s).`, locked: true };
        }

        // 2. Comparer les hash (pur JS, synchrone)
        const userOk = sha256(username) === sha256(ADMIN_USERNAME);
        const passOk = sha256(password) === ADMIN_PASSWORD_HASH;

        if (!userOk || !passOk) {
            const next = recordFailedAttempt();
            const left = MAX_ATTEMPTS - next;
            if (left <= 0)
                return { success: false, message: 'Compte verrouillé pour 30 minutes.', locked: true };
            return { success: false, message: `Identifiant ou mot de passe incorrect. (${left} tentative(s) restante(s))` };
        }

        // 3. Créer la session signée
        const token = generateSessionToken();
        const expiry = String(Date.now() + SESSION_DURATION);
        const sign = signToken(token, expiry);
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_EXPIRY_KEY, expiry);
        localStorage.setItem(AUTH_SIGN_KEY, sign);
        resetAttempts();
        setIsAdmin(true);
        return { success: true };
    }, []);

    const logout = useCallback(() => { clearSession(); setIsAdmin(false); }, []);

    const lockoutInfo = useCallback(() => {
        if (isLockedOut()) return { locked: true, remainingSeconds: getRemainingLockoutSeconds() };
        const { attempts } = getLockoutInfo();
        return { locked: false, attemptsLeft: MAX_ATTEMPTS - attempts };
    }, []);

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout, lockoutInfo }}>
            {children}
        </AuthContext.Provider>
    );
};


