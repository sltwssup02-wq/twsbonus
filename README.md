# Multi-Project Cloud Dashboard

මෙම ව්‍යාපෘතිය Cloud Dashboard එකක් වන අතර, කේතය පහසුවෙන් කළමනාකරණය කිරීම සඳහා මෙය සම්පූර්ණයෙන්ම **MVC (Model-View-Controller)** ආකෘතියට අනුව නැවත සකස් කර ඇත. මෙය GitHub Pages හරහා ඉතා පහසුවෙන් host කළ හැක.

## 📂 ව්‍යාපෘති ව්‍යුහය (Project Structure)

මෙම ව්‍යාපෘතියේ කේතය ප්‍රධාන ගොනු (files) 4කට වෙන් කර ඇත:

* **`index.html`**
  ඔබගේ මූලික HTML කේතය මෙහි අඩංගු වේ. පැරණි කේතයම මෙහි ඇති අතර, වෙනසකට ඇත්තේ පහළින්ම ඇති script tag එක හරහා `controller.js` ගොනුව පමණක් සම්බන්ධ කර තිබීමයි.

* **`model.js` (Model)**
  Firebase සම්බන්ධතාවය (initialization) සහ Database state එක කළමනාකරණය කිරීම මෙමගින් සිදු කෙරේ. දත්ත ගබඩා කිරීම සහ ලබා ගැනීම මෙහි ප්‍රධාන කාර්යයයි.

* **`view.js` (View)**
  වෙබ් පිටුවේ ඇති DOM elements ලබා ගැනීම සහ UI (User Interface) එක යාවත්කාලීන කිරීම් මෙමගින් සිදු කරයි. දත්ත වගු වලට පෙන්වීම (tables), පෝරම (forms) සැඟවීම සහ පෙන්වීම මෙහි වගකීමයි.

* **`controller.js` (Controller)**
  Events, Actions සහ Model සිට View වෙත ඇති සම්බන්ධතාවය ගොඩනගන්නේ මෙම ගොනුව මගිනි. පරිශීලකයා බොත්තමක් එබූ විට හෝ දත්ත ඇතුලත් කළ විට, ඊට අදාළ දත්ත `model` එකෙන් ලබාගෙන `view` එක හරහා තිරයේ පෙන්වීම මෙය මගින් පාලනය කෙරේ.

## 🚀 ධාවනය කරන ආකාරය (How to Run)

1. `index.html`, `model.js`, `view.js`, `controller.js` සහ ඔබගේ `style.css` යන ගොනු සියල්ලම එකම ෆෝල්ඩරයක (folder) තබාගන්න.
2. `index.html` ගොනුව ඔබගේ වෙබ් බ්‍රවුසරයෙන් (Chrome, Firefox ආදිය) විවෘත කරන්න.
3. මෙය සජීවීව අන්තර්ජාලයට එක් කිරීමට අවශ්‍ය නම්, මෙම ෆෝල්ඩරය GitHub වෙත upload කර **GitHub Pages** හරහා host කරන්න. ES6 Modules භාවිතා කර ඇති බැවින් එය කිසිදු ගැටළුවකින් තොරව ක්‍රියාත්මක වනු ඇත.

## 🛠️ භාවිතා කළ තාක්ෂණයන් (Technologies Used)

* HTML5 & CSS3
* Vanilla JavaScript (ES6 Modules)
* Firebase (Realtime Database)
* MVC Architecture