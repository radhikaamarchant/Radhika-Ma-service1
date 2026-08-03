const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `           if (isDesktop && (!lastLoginTime || now - parseInt(lastLoginTime) > twentyFourHours)) {
              // Needs 2FA. Do not auto login. Let Login page handle it.
           } else {
             dispatch({ type: "SET_CURRENT_USER", payload: user });
           }`;

const newStr = `           if (isDesktop && (!lastLoginTime || now - parseInt(lastLoginTime) > twentyFourHours)) {
              // Needs 2FA. Do not auto login. Let Login page handle it.
           } else {
             if (!state.currentUser || state.currentUser.id !== user.id) {
               dispatch({ type: "SET_CURRENT_USER", payload: user });
             }
           }`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, newStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Updated App.tsx user loop.");
} else {
  console.error("Target string not found in App.tsx (user loop).");
}
