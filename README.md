# Bit

> [!NOTE]
> Bit is a code that is made by half human, half robot.

> [!WARNING]
> Bit is currently in development. Expect bugs, especially on variants.

Bit is an open-source chess assistant (**not a chess cheat**), designed to help you make better moves using a chess engine. Just install the userscript, open the Bit GUI, and you're ready to go. No downloads necessary!

* No anti-features on userscript (*e.g. ads and tracking*)
* WebAssembly chess engine (faster than regular JavaScript engines)
* Supports the most popular chess game sites (*e.g. chess.com, lichess.org*)
* Supports multiple move suggestions, move arrow markings, chess variants & fonts
* Translated to 30+ languages

> [!CAUTION]
> Please be advised that the use of Bit may violate the rules and lead to disqualification or banning from tournaments and online platforms. The developers of Bit and related systems will NOT be held accountable for any consequences resulting from its use. We strongly advise to use Bit only in a controlled environment ethically.

| [▶️ Open Bit](https://bitbytelabs.github.io/Bit) | [⬇️ Install](https://github.com/bitbytelabs/Bit/blob/main/bit.user.js)  | [💬 Discuss With Community](https://github.com/bitbytelabs/Bit/discussions)
|-------|-------|-------|

## Getting Started

Simply [install the Bit userscript](https://github.com/bitbytelabs/Bit/blob/main/bit.user.js), open the [Bit GUI](https://bitbytelabs.github.io/bit/) and a supported chess game site. Then, just start playing!

> [!IMPORTANT]
> You need to keep the Bit GUI tab active to keep the whole system functional. Think of the tab as an engine of a car, the userscript alone is simply an empty hull, it won't run, nor move. The Bit GUI has the chess engine which calculates the moves.

## Q&A

### Why did I get banned, wasn't this impossible to detect?

Chess engines simply play differently than humans. It's fairly easy to detect by pure statistics. For example, chess.com bans about 16 000 players for fair play abuse each month.

Your ban most likely wasn't because of the site detecting Bit, it was because of your suspicious behaviour patterns. Bit cannot fix this, it's your responsiblity to play as a human.

Don't want to get banned again? Don't use Bit against other humans.

### Why doesn't it work?

Before making an issue, please read these:

- Make sure the [Bit GUI](https://bitbytelabs.github.io/Bit/) is active. Do not close the tab. Browsers freeze code execution on inactive pages, you need to visit the Bit GUI tab from time to time or keep it open on a separate window. This prevents Bit from freezing and not giving any move suggestions, for example.

- Do you not see any moves displayed on the chess site? Are you sure you have enabled "Display Moves On External Site" box on the Bit GUI settings? After enabling that setting, please refresh the chess site to see changes.

- Are you trying to play variants on Chess.com? If so, it's not currently supported very well. Other sites with variants might also be buggy, you can make an issue about that if you want.

- Make sure you did NOT set "Piece Animations" to "Arcade" on Chess.com board settings! Set the "Piece Animations" to "None" so that Bit can parse the board correctly.

- If Bit complains having no userscript even though it is installed, press down the "shift" key, and then click your browser's refresh button to perform a hard refresh, hopefully clearing the wrongly cached state.

- Nothing is helping? Restart your PC. Try Violentmonkey and a Chromium based browser, such as Brave. Use the default config. Keep two windows open at the same time next to each other, one having the GUI and one the chess site.

Otherwise, it could be a bug, please make an issue [here](https://github.com/bitbytelabs/bit/issues/new). 

> [!NOTE]
> When making an issue, please be descriptive! Mention,
> - The chess site and the variant you were playing.
> - The browser and the userscript manager you were using.
> - What did you do for the bug to happen, does it happen often? How could I reproduce it?
> - You can also include a screenshot of the browser console (e.g. `CTRL + SHIFT + I` or right click, inspect, and go to the console tab), look for **grey underlined text** at the beginning of a red background area, on the right side of the screen, which has the word 'Bit'. That's an error from the userscript.

## Development

### Bit GUI

#### Hosting on localhost

1) Install the Bit userscript.
2) Select a webserver of your choosing, e.g. [UwAmp](https://www.uwamp.com/en/).
3) Create a folder named `Bit` to the root folder of your webserver. (e.g. `www/Bit`)
4) Clone the repository and put the files inside the folder you just created.
6) You should now see Bit running on `http://localhost/Bit/`.
7) Make sure the Bit userscript is on and you should be good to go!

> [!WARNING]
> Make sure there are no additional folders which would make the URL like `http://localhost/Bit/Bit/`.

> [!TIP]
> You can show hidden features by adding `?hidden=true`. For only developers, no updates guaranteed.

> [!TIP]
> You can use [GitHub Desktop](https://desktop.github.com/) to make Git actions such as cloning easy.

### Bit Userscript

Developing the userscript is easy, simply develop it as you'd any other userscripts.

> [!NOTE]
> Browsers might cache userscripts after you've refreshed the site enough times. If you notice your userscript being cached, disable the userscript, refresh the page, then enable the userscript and refresh the page again.
## Used Libraries ❤︎

* [Fairy Stockfish WASM](https://github.com/fairy-stockfish/fairy-stockfish.wasm) (*the chess engine of Bit*)
* [Stockfish WASM](https://github.com/nmrugg/stockfish.js/) (*another chess engine of Bit*)
* [ZeroFish](https://github.com/schlawg/zerofish) (*WASM port of Lc0 and the latest Stockfish, another chess engine of Bit*)
* [Maia-Chess](https://github.com/CSSLab/maia-chess) (*legit looking weights for Lc0*)
* [Maia-Platform-Frontend](https://github.com/CSSLab/maia-platform-frontend) (*source for the Maia 2 engine*)
* [Lozza](https://github.com/op12no2/lozza) (*another chess engine of Bit*)
* [COI-Serviceworker](https://github.com/gzuidhof/coi-serviceworker) (*allowing WASM on GitHub pages, extremely important library*)
* [ChessgroundX](https://github.com/gbtami/chessgroundx) (*for displaying a board on the GUI. Modified the library a bit*)
* [FileSaver](http://purl.eligrey.com/github/FileSaver.js) (*for saving the config file*)
* [bodymovin](https://github.com/airbnb/lottie-web) (*for SVG animations*)
* [chess.js](https://github.com/jhlywa/chess.js) (*used for Maia 2 engine implementation*)
* [onnxruntime-web](https://github.com/Microsoft/onnxruntime) (*used for Maia 2 engine implementation*)
* [Klaro!](https://github.com/klaro-org/klaro-js) (*for legal reasons, to ask user for cookie permission*)
* [SnapDOM](https://github.com/zumerlab/snapdom) (*for DOM screenshots (e.g. turning the board into image)*)
* [UniversalBoardDrawer](https://github.com/Hakorr/UniversalBoardDrawer) (*for drawing arrows on the GUI and the chess site chessboards*)
* [CommLink](https://github.com/AugmentedWeb/CommLink) (*for cross-window communication between the GUI tab and chess sites*)
