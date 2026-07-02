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
    experimentalForceLongPolling: true,
  },
  (firebaseConfig as any).firestoreDatabaseId
);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

let isSigningIn = false;
export let cachedAccessToken: string | null = null;

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const initAuth = (
  onAuthSuccess?: (user: User) => void,
) => {
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
