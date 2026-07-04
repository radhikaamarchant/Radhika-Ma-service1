import fs from 'fs';
let code = fs.readFileSync('src/components/SwipeButton.tsx', 'utf8');

code = code.replace(
  `      setTimeout(() => {
        if (isMounted.current) onSuccess();
        setTimeout(() => {
          if (isMounted.current) {
            setIsSuccess(false);
            controls.start({ x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.4 } });
          }
        }, 500);
      }, 1000);`,
  `      if (isMounted.current) onSuccess();
      // Only reset after a long delay in case the parent doesn't unmount us
      setTimeout(() => {
        if (isMounted.current) {
          setIsSuccess(false);
          controls.start({ x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.4 } });
        }
      }, 3000);`
);

// Also fix the desktop button
code = code.replace(
  `        onClick={() => {
          if (isSuccess) return;
          setIsSuccess(true);
          setTimeout(() => {
            onSuccess();
            setTimeout(() => {
              if (isMounted.current) setIsSuccess(false);
            }, 1000);
          }, 300);
        }}`,
  `        onClick={() => {
          if (isSuccess) return;
          setIsSuccess(true);
          onSuccess();
          setTimeout(() => {
            if (isMounted.current) setIsSuccess(false);
          }, 3000);
        }}`
);

fs.writeFileSync('src/components/SwipeButton.tsx', code);
console.log("Success Swipe2 Patch");
