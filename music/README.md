# Ambient music

The audio button on the site plays the file **`ambient.mp3`** in this folder, on loop.

To set it up: drop a royalty-free ambient track here and name it exactly `ambient.mp3`.

Until that file exists, the sound button will simply do nothing when clicked
(the browser can't load a missing file). No errors are shown to visitors.

To use a different filename or format, update the path in `../site.js`
(look for `new Audio('music/ambient.mp3')`).
