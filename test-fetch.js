try {
  new URL("https://www.googleapis.com/drive/v3/files?q=name='Firebase Fallback Data Backup' and trashed=false");
  console.log("Success");
} catch(e) {
  console.log(e);
}
