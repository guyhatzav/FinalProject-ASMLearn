<div dir="rtl">
  <p align="center">
    <a href="https://asmlearn.com/"><img src="https://i.imagesup.co/images2/42354bf8b1da4e293ec1f2fe01d6c83fadf50eb8.png" width="300"></a>
  </p>
<p align="center">
   <a href="https://firebase.google.com/docs/web/setup?authuser=0#from-the-cdn/"><img src="https://img.shields.io/badge/Firebase-v7.19.0-blue"></a>
   <a href="https://nodejs.org/en/docs/"><img src="https://img.shields.io/badge/Node.js-8-lightorange"></a>
   <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/ExpressJS-v4.x-lightgrey"></a>
</p>
 <h5>
   חלק זה של הפרויקט הוא ה-Backend של המערכת ומשמש לניהול המערכת בכלל, וניהול המשתמשים והמטלות בפרט. אופן מתן המענה למשתמשים מתבצע באמצעות בקשות בפרוטוקול HTTP הרצות בשרתים של חברת גוגל תחת פונקציות הענן של Firebase. 
 </h5>
  <h5>
    Firebase Cloud Functions הוא שירות המאפשר שליחת לוגיקה לשרת מרוחק בצורה של פונקציות. כל זאת מבלי לדאוג לתשתיות ולשלם רק עבור המשאבים בהם נעשה שימוש בפועל. בשיטה זו, השירות מפשט את כתיבת, תחזוקת, והפעלת קוד ה-Backend.
פונקציות הענן פועלות כמעין חתיכות לגו אותן ניתן לחבר לכל שירותי Firebase. לדוגמא, ניתן להפעיל פונקציה כאשר תמונה מועלה לאחסון Firebase על מנת ליצור תמונה ממוזערת. בנוסף, ניתן לנקות נתוני משתמש מסוימים כאשר ענף נמחק ב-Realtime Database. בצורה זו, כמעט כל עניין שמתרחש ב- Firebase יכול להפעיל פונקציה. 
יחד עם זאת, בפרויקט זה בחרתי להשתמש בשירות באמצעות הפעלתו כ-Requests HTTP תוך שימוש בפונקציות מסוגים שונים, כגון: GET, POST ועוד. כתיבת הפונקציות נעשתה בשפת TypeScript הן מורצות בענן באמצעות טכנולוגיית Node.js 8 הפועלת ביחד עם ה-Framework הפופולרי ExpressJS.
  </h5>
  <h5>על מנת להתחיל לעבוד בצד השרת יש תחילה להתקין ולאתחל את סביבת הפיתוח של Firebase במחשבך האישי. הסבר מפורט כיצד עושים זאת ניתן למצוא <a href="https://firebase.google.com/docs/functions/get-started?hl=en">כאן</a>.</h5>
  <h5>לאחר סיום ההתקנה והאתחול, יש לקבל מצוות הפיתוח הנוכחי את הרשאות הגישה לפרויקט, לאתחל את הפרויקט במחשבך האישי ולהחליף את הקובץ בנתיב המופיע מטה, לקובץ המופיע בתיעוד.</h5>
 
  ```
  YOUR_PATH/functions/src/index.ts
  ```
    
 # פירוט הפונקציות במערכת

</div>
