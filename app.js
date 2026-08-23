import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';

// elements
const fileInput = document.getElementById('fileInput');
const sampleBtn = document.getElementById('sampleBtn');
const player = document.getElementById('player');
const uploadLabel = document.getElementById('uploadLabel');
const searchBox = document.getElementById('searchBox');
const searchBtn = document.getElementById('searchBtn');
const status = document.getElementById('status');
const results = document.getElementById('results');
const resultCount = document.getElementById('resultCount');
const downloadBox = document.getElementById('downloadBox');
const downloadText = document.getElementById('downloadText');
const downloadBar = document.getElementById('downloadBar');
const mobileWarning = document.getElementById('mobileWarning');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let model = null;
let frames = []; // { time, img } for every sampled frame in the current video

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
if (isMobile) mobileWarning.classList.remove('hidden');

loadModel();

async function loadModel() {
    try {
        model = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
            progress_callback: (p) => {
                if (p.status === 'progress') {
                    const pct = Math.round(p.progress || 0);
                    downloadBar.style.width = pct + '%';
                    downloadText.textContent = `Loading model... ${pct}%`;
                }
            }
        });

        downloadBox.classList.add('hidden');
        status.textContent = 'Model loaded. Upload a video to get started.';
    } catch (err) {
        downloadText.textContent = "Couldn't load the model — try refreshing the page.";
        console.error(err);
    }
}

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadVideo(URL.createObjectURL(file));
});

// the sample video just ships alongside index.html, no upload needed
sampleBtn.addEventListener('click', () => loadVideo('sample.mp4'));

async function loadVideo(src) {
    // load it into a throwaway video element just to read duration + grab frames
    const temp = document.createElement('video');
    temp.src = src;
    status.textContent = 'Checking video...';

    temp.onerror = () => {
        status.textContent = "Couldn't load that video.";
    };

    temp.onloadedmetadata = async () => {
        const duration = temp.duration;

        if (duration > 3600) {
            alert('That video is over an hour long, try something shorter.');
            status.textContent = '';
            return;
        }

        if (isMobile && duration > 600) {
            const ok = confirm('This video is longer than 10 minutes, it might be slow on your phone. Continue anyway?');
            if (!ok) {
                status.textContent = '';
                return;
            }
        }

        player.src = src;
        player.classList.remove('hidden');
        uploadLabel.classList.add('hidden');
        sampleBtn.classList.add('hidden');

        // don't sample every 2 seconds for a long video or we'd end up with thousands of frames
        let step = 2;
        if (duration > 600) step = 5;
        if (duration > 1800) step = 10;

        status.textContent = 'Reading frames from the video...';
        frames = await grabFrames(temp, step);
        status.textContent = `Got ${frames.length} frames. Type something below and hit search.`;

        if (model) {
            searchBox.disabled = false;
            searchBtn.disabled = false;
        }
    };
}

function grabFrames(video, step) {
    return new Promise((resolve) => {
        const out = [];
        let t = 0;
        video.muted = true;

        video.onseeked = () => {
            ctx.drawImage(video, 0, 0, 224, 224);
            out.push({ time: t, img: canvas.toDataURL('image/jpeg', 0.8) });

            t += step;
            status.textContent = `Reading frames... ${Math.min(100, Math.round((t / video.duration) * 100))}%`;

            if (t < video.duration) {
                video.currentTime = t;
            } else {
                resolve(out);
            }
        };

        video.currentTime = t;
    });
}

searchBtn.addEventListener('click', runSearch);
searchBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') runSearch();
});

async function runSearch() {
    const query = searchBox.value.trim();
    if (!query || frames.length === 0 || !model) return;

    searchBtn.disabled = true;
    searchBox.disabled = true;
    status.textContent = `Searching for "${query}"...`;
    results.innerHTML = '';

    const scored = [];

    // run every frame through CLIP
    // then sort by how confident it is that the frame matches the query
    for (let i = 0; i < frames.length; i++) {
        const out = await model(frames[i].img, [query, 'something else']);
        const match = out.find((o) => o.label === query);
        scored.push({ time: frames[i].time, img: frames[i].img, score: match ? match.score : 0 });

        if (i % 5 === 0) {
            status.textContent = `Searching... ${Math.round((i / frames.length) * 100)}%`;
        }
    }

    scored.sort((a, b) => b.score - a.score);
    showResults(scored);

    searchBtn.disabled = false;
    searchBox.disabled = false;
    status.textContent = `Done — best matches for "${query}" are on the right.`;
}

function showResults(list) {
    results.innerHTML = '';
    resultCount.textContent = `${list.length} frames`;

    list.forEach((r) => {
        const pct = Math.round(r.score * 100);
        const min = Math.floor(r.time / 60);
        const sec = Math.floor(r.time % 60).toString().padStart(2, '0');

        const btn = document.createElement('button');
        btn.className = 'result';
        btn.onclick = () => {
            player.currentTime = r.time;
            player.play();
        };

        btn.innerHTML = `
      <img src="${r.img}" alt="frame at ${min}:${sec}" />
      <div class="info">
        <div class="top">
          <span>${min}:${sec}</span>
          <span>${pct}%</span>
        </div>
        <div class="meter"><div style="width:${pct}%"></div></div>
      </div>
    `;

        results.appendChild(btn);
    });
}