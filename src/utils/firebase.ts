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
// Removed spreadsheet scopes

let isSigningIn = false;
let signInPromise: Promise<{ user: User } | null> | null = null;

export const googleSignIn = async (): Promise<{ user: User } | null> => {
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
          await signInWithRedirect(auth, provider);
          return null;
        }
      }
      
      return { user: result.user };
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/popup-blocked') {
        alert("Google Sign-In popup was blocked. Please click the 'Open in New Tab' icon (↗️) in the top right corner of AI Studio, or allow popups for this site.");
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
      // nothing needed here
    }
  }).catch((err) => {
    console.error("Redirect error", err);
  });

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
       if (onAuthSuccess) onAuthSuccess(user);
    } else {
      try {
        if (!isSigningIn) {
          isSigningIn = true;
          await signInAnonymously(auth);
          isSigningIn = false;
        }
      } catch (error) {
        console.error("Auth error", error);
        isSigningIn = false;
      }
    }
  });
};

export const logout = async () => {
  await auth.signOut();
};
