const STORAGE_KEY = "diaryLogs";
let selectedMood = "";
let logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const doneContainer = document.getElementById("doneInputs");
const notDoneContainer = document.getElementById("notDoneInputs");
const nextHopeContainer = document.getElementById("nextHopeInputs");

function createInputs(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const input = document.createElement("input");
        container.appendChild(input);
    }
}

createInputs(doneContainer, 3);
createInputs(notDoneContainer, 3);
createInputs(nextHopeContainer, 2);

document.querySelectorAll(".mood-select button").forEach(btn => {
    btn.addEventListener("click", () => {
        selectedMood = btn.dataset.mood;
    });
});

document.getElementById("saveBtn").addEventListener("click", () => {
    const date = new Date().toISOString().split("T")[0];

    const newLog = {
        date,
        done: [...doneContainer.querySelectorAll("input")].map(i => i.value).filter(Boolean),
        notDone: [...notDoneContainer.querySelectorAll("input")].map(i => i.value).filter(Boolean),
        nextHope: [...nextHopeContainer.querySelectorAll("input")].map(i => i.value).filter(Boolean),
        mood: selectedMood
    };

    logs.push(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

    alert("保存しました");
});

document.getElementById("navWrite").onclick = () => switchView("writeView");
document.getElementById("navReview").onclick = () => {
    switchView("reviewView");
    renderReview("7");
};

function switchView(id) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

document.querySelectorAll(".period-select button").forEach(btn => {
    btn.addEventListener("click", () => {
        renderReview(btn.dataset.period);
    });
});

function renderReview(period) {
    const list = document.getElementById("logList");
    const wordCloud = document.getElementById("wordCloud");
    const dateDots = document.getElementById("dateDots");

    list.innerHTML = "";
    wordCloud.innerHTML = "";
    dateDots.innerHTML = "";

    let filtered = logs;

    if (period !== "all") {
        const days = parseInt(period);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filtered = logs.filter(l => new Date(l.date) >= cutoff);
    }

    const allWords = [];

    filtered.forEach(log => {
        const card = document.createElement("div");
        card.className = "log-card";

        card.innerHTML = `<strong>${log.date}</strong><br>
      できたこと: ${log.done.join(", ")}<br>
      できなかったこと: ${log.notDone.join(", ")}<br>
      次回: ${log.nextHope.join(", ")}<br>
      気分: ${log.mood || ""}`;

        list.appendChild(card);

        [...log.done, ...log.notDone].forEach(text => {
            text.split(" ").forEach(w => allWords.push(w));
        });

        const dot = document.createElement("span");
        dateDots.appendChild(dot);
    });

    const uniqueWords = [...new Set(allWords)];
    uniqueWords.slice(0, 20).forEach(word => {
        const span = document.createElement("span");
        span.textContent = word;
        span.style.marginRight = "8px";
        wordCloud.appendChild(span);
    });
}