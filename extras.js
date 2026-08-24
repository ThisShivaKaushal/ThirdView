//a couple of extra layered on top of app.js
//kept in a separate file to keep app.js clean ad easy to recognize for future update

const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");
const quickTries = document.getElementById("quickTries");

//press "/" anywhere on the page to jump staright into the serach box,

document.addEventListener("keydown", (e) => {
    if (e.key !== '/') return;

    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return; //don't hijack while typing somewhere😁

    e.preventDefault();
    searchBox.focus();
});

//quick-try chips: click one and it runs the search for you
//stays hidden until search is actually usable (video + model both )

if (quickTries) {
    quickTries.querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            if (searchBtn.disabled) return;
            // put the chip text into the search box, then start the search
            searchBox.value = chip.textContent.trim();
            searchBox.focus();
            // trigger the button (app.js has the click listener attached)
            searchBtn.click();
        });
    });

    const revealWhenReady = new MutationObserver(() => {
        if (!searchBox.disabled) {
            quickTries.classList.remove('hidden');
        }
    });
    revealWhenReady.observe(searchBox, { attributes: true, attributeFilter: ['disabled'] });
}
