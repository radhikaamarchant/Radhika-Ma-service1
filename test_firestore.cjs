const admin = require('firebase-admin');

// We don't have a service account JSON, we just have the client config. 
// Without a service account, we can't easily init admin SDK locally unless we have application default credentials.
