import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

export const app = initializeApp({
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
});

export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  },
  (firebaseConfig as any).firestoreDatabaseId
);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let signInPromise: Promise<{ user: User; accessToken: string } | null> | null = null;
export let cachedAccessToken: string | null = null;

export const googleSignIn = async (pendingAction?: 'sync' | 'restore'): Promise<{ user: User; accessToken: string } | null> => {
  if (signInPromise) {
    return signInPromise;
  }

  signInPromise = (async () => {
    try {
      isSigningIn = true;
      
      const inIframe = window.self !== window.top;
      let result;
      
      if (inIframe) {
        // In iframe, we MUST use popup. Redirect will break or be blocked.
        result = await signInWithPopup(auth, provider);
      } else {
        // Not in iframe, try popup first. If it fails (blocked), fallback to redirect.
        try {
          result = await signInWithPopup(auth, provider);
        } catch (err: any) {
          console.warn("Popup blocked or failed, falling back to redirect", err);
          if (pendingAction) {
            localStorage.setItem('pendingGoogleAction', pendingAction);
          }
          await signInWithRedirect(auth, provider);
          return null;
        }
      }

      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Failed to get access token from Firebase Auth');
      }
      cachedAccessToken = credential.accessToken;
      
      if (pendingAction) {
        window.dispatchEvent(new CustomEvent('googleAuthSuccess', { detail: { action: pendingAction } }));
      }
      
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/popup-blocked') {
        alert("Google Sign-In popup was blocked by your browser. Please allow popups for this site, or open the app in a new tab.");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert(`Error: This domain (${window.location.hostname}) is not authorized. Please add it in Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
      } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        alert(`Google Sign-In Error: ${error.message}`);
      }
      throw error;
    } finally {
      isSigningIn = false;
      signInPromise = null;
    }
  })();
  
  return signInPromise;
};

export const initAuth = (
  onAuthSuccess?: (user: User) => void,
) => {
  // Check for redirect result in case signInWithRedirect was used
  getRedirectResult(auth).then((result) => {
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
      }
      const pendingAction = localStorage.getItem('pendingGoogleAction');
      if (pendingAction) {
        localStorage.removeItem('pendingGoogleAction');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('googleAuthSuccess', { detail: { action: pendingAction } }));
        }, 1000);
      }
    }
  }).catch((err) => {
    console.error("Redirect error", err);
  });

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Check if it's an anonymous user
      if (user.isAnonymous) {
         if (onAuthSuccess) onAuthSuccess(user);
      } else {
         if (onAuthSuccess) onAuthSuccess(user);
      }
    } else {
      try {
        if (!isSigningIn) {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error", error);
      }
    }
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
