const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
  });
  
console.log(formatter.format(new Date()).toLowerCase());
