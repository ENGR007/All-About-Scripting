// SAFE Google Translate API endpoint (free, stable)
async function googleTranslate(text, source, target) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url);
    const data = await res.json();

    return data[0].map(x => x[0]).join("");
}

// Convert Chinese → Pinyin using FULL LIBRARY
function convertToPinyin(text) {
    if (!window.pinyin) return text;

    try {
        return window.pinyin(text, {
            style: window.pinyin.STYLE_TONE, // ā á ǎ à
            heteronym: false
        }).flat().join(" ");
    } catch (e) {
        return text;
    }
}

// MAIN TRANSLATE FUNCTION
async function translateText() {
    const input = document.getElementById("inputText").value.trim();
    const from = document.getElementById("fromLang").value;
    const to = document.getElementById("toLang").value;
    const outputBox = document.getElementById("output");

    if (!input) {
        outputBox.innerHTML = "<i>Please enter text.</i>";
        return;
    }

    let translated = await googleTranslate(input, from, to);
    let finalOutput = translated;

    // Add Pinyin when selected
    if (to === "zh") {
        const pinyin = convertToPinyin(translated);
        finalOutput = `${translated}<br><br><b>Pinyin:</b><br>${pinyin}`;
    }

    outputBox.innerHTML = finalOutput;
}

// SPEAK OUTPUT
function speakOutput() {
    const text = document.getElementById("output").innerText;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = document.getElementById("toLang").value;
    speechSynthesis.speak(utter);
}