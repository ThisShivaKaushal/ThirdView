//a couple of extra layered on top of app.js
//kept in a separate file to keep app.js clean ad easy to recognize for future update

const searchBox = document.getElementById("searchBox");
const searchBtn = document.getElementById("searchBtn");
const quickTries = document.getElementById("quickTries");

//press "/" anywhere on the page to jump staright into the serach box,

document.addEventListener("keydown", (e) => {
    if (e.key !== '/') return;

    const tag = document.activeElement.tagName;
    if (tag === 'Input' || tag === 'TEXTAREA') return; //don't hijack while typing somewhere😁

    e.preventDefault();
    searchBox.focus();
});

//quick-try chips: click one and it runs the search for you
//stays huidden until search is actually usable (video + model both )

if (quickTries) {
    quickTries.querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            if (searchBtn.disabled) return;
            searchBtn.click(); //start the logic of app.js
        });
    });

    const revealWhenReady = new MutationObserver(() => {
        if (!searchBox.disabled) {
            quickTries.classList.remove('hidden');
        }
    });
    revealWhenReady.observe(searchBox, { attributes: true, attributeFilter: ['disabled'] });
}