const STORAGE_KEY = "diaryLogs";
let logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const doneContainer = document.getElementById("doneInputs");
const nextHopeContainer = document.getElementById("nextHopeInputs");
const nextSelfMessageContainer = document.getElementById("nextSelfMessageInputs");

const selectedContainer = document.getElementById("selectedMoods");
const unselectedContainer = document.getElementById("unselectedMoods");

const moodOptions = ["穏やか", "少し疲れた", "前向き", "静か"];
let selectedMoods = [];

/* ---------------------------
   入力生成（textarea）
---------------------------- */
function createInputs(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const textarea = document.createElement("textarea");
        textarea.rows = 1;
        textarea.style.resize = "none";
        container.appendChild(textarea);
    }
}

createInputs(doneContainer, 3);
createInputs(nextHopeContainer, 2);
createInputs(nextSelfMessageContainer, 1);

/* ---------------------------
   textarea自動高さ調整
---------------------------- */
document.addEventListener("input", function (e) {
    if (e.target.tagName === "TEXTAREA") {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    }
});

/* ---------------------------
   気分選択
---------------------------- */
function renderMoods() {
    selectedContainer.innerHTML = "";
    unselectedContainer.innerHTML = "";

    moodOptions.forEach(mood => {
        const btn = document.createElement("button");
        btn.textContent = mood;
        btn.className = "mood-btn";

        btn.onclick = () => toggleMood(mood);

        if (selectedMoods.includes(mood)) {
            btn.classList.add("selected");
            selectedContainer.appendChild(btn);
        } else {
            unselectedContainer.appendChild(btn);
        }
    });
}

function toggleMood(mood) {
    if (selectedMoods.includes(mood)) {
        selectedMoods = selectedMoods.filter(m => m !== mood);
    } else {
        selectedMoods.push(mood);
    }
    renderMoods();
}

renderMoods();

/* ---------------------------
   保存処理
---------------------------- */
document.getElementById("saveBtn").addEventListener("click", () => {
    const date = new Date().toISOString().split("T")[0];

    const newLog = {
        id: Date.now(),   // ← 削除用ID追加
        date,
        done: [...doneContainer.querySelectorAll("textarea")]
            .map(t => t.value.trim())
            .filter(Boolean),
        nextHope: [...nextHopeContainer.querySelectorAll("textarea")]
            .map(t => t.value.trim())
            .filter(Boolean),
        nextSelfMessage: [...nextSelfMessageContainer.querySelectorAll("textarea")]
            .map(t => t.value.trim())
            .filter(Boolean),
        moods: [...selectedMoods]
    };

    logs.push(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

    resetForm();
    alert("保存しました");
});

/* ---------------------------
   フォームリセット
---------------------------- */
function resetForm() {
    document.querySelectorAll("textarea").forEach(t => {
        t.value = "";
        t.style.height = "auto";
    });
    selectedMoods = [];
    renderMoods();
}

/* ---------------------------
   画面切り替え
---------------------------- */
document.getElementById("navWrite").onclick = () => switchView("writeView");

document.getElementById("navReview").onclick = () => {
    switchView("reviewView");
    renderReview("7");
};

function switchView(id) {
    document.querySelectorAll(".view").forEach(v =>
        v.classList.remove("active")
    );
    document.getElementById(id).classList.add("active");
}

/* ---------------------------
   期間選択
---------------------------- */
document.querySelectorAll(".period-select button").forEach(btn => {
    btn.addEventListener("click", () => {
        renderReview(btn.dataset.period);
    });
});

/* ---------------------------
   削除処理
---------------------------- */
function deleteLog(id) {
    const confirmed = confirm("この記録を削除しますか？");
    if (!confirmed) return;

    logs = logs.filter(log => log.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    renderReview("all");
}

/* ---------------------------
   振り返り表示
---------------------------- */
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

    filtered.forEach(log => {
        const card = document.createElement("div");
        card.className = "log-card";

        appendSection(card, "できたこと", log.done);
        appendSection(card, "次回にできるといいこと", log.nextHope);
        appendSection(card, "次回の自分に一言", log.nextSelfMessage);
        appendSection(card, "気分", log.moods);


        // ヘッダー行作成
        const header = document.createElement("div");
        header.classList.add("log-header");

        // 日付
        const dateEl = document.createElement("strong");
        dateEl.textContent = log.date;

        // 削除ボタン
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "削除";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.onclick = () => deleteLog(log.id);

        // ヘッダーに追加
        header.appendChild(dateEl);
        header.appendChild(deleteBtn);

        // カードに追加
        card.appendChild(header);
        list.appendChild(card);

        const dot = document.createElement("span");
        dateDots.appendChild(dot);
    });
}

/* ---------------------------
   セクション描画
---------------------------- */
function appendSection(parent, title, items) {
    if (!items || items.length === 0) return;

    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = title + ": ";
    p.appendChild(strong);

    items.forEach((item, index) => {
        const span = document.createElement("span");
        span.textContent = item;
        span.style.whiteSpace = "pre-wrap";
        p.appendChild(span);

        if (index < items.length - 1) {
            p.appendChild(document.createTextNode(" / "));
        }
    });

    parent.appendChild(p);
}