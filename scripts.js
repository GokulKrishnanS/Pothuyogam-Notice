if ("serviceWorker" in navigator) {
	navigator.serviceWorker
		.register("./service-worker.js", { scope: "./" })
		.then((registration) => {
			console.log(
				"Service Worker registered with scope:",
				registration.scope
			);
		})
		.catch((error) => {
			console.error("Service Worker registration failed:", error);
		});
}

const meetingTimeElement = document.getElementById("meeting-time");
const createDateElement = document.getElementById("create-date");
const agendaElement = document.getElementById("agenda-matter");
const shareButton = document.getElementById("share");
const normalAgenda =
	"പ്രതിമാസ കരയോഗം നടപടികൾ, വാത്തികുളം ദേവീക്ഷേത്ര സംബന്ധമായ കാര്യങ്ങൾ, ഉത്സവം ഒരു അവലോകനം, മറ്റ് അത്യാവശ്യകാര്യങ്ങൾ";

mTime = getLocalValues("meetingTime");
meetingTimeElement.textContent =
	mTime !== null && mTime !== "" ? mTime : "പൊതുയോഗ സമയം";

cDate = getLocalValues("createDate");
createDateElement.textContent =
	cDate !== null && cDate !== "" ? cDate : "തീയതി";

localAgenda = getLocalValues("localAgenda");
agendaElement.textContent =
	localAgenda !== null && localAgenda !== "" ? localAgenda : normalAgenda;

meetingTimeElement.addEventListener("click", () => {
	let message = "പൊതുയോഗ സമയം തിരുത്തുക";
	editValues(meetingTimeElement, message, mTime, "meetingTime"); // meetingTime is Local Storage Name
});

createDateElement.addEventListener("click", () => {
	let message = "തീയതി തിരുത്തുക";
	editValues(createDateElement, message, cDate, "createDate"); // createDate is Local Storage Name
});

agendaElement.addEventListener("click", () => {
	let message = "അജണ്ട തിരുത്തുക";
	editValues(agendaElement, message, localAgenda, "localAgenda"); // createDate is Local Storage Name
});

//All event listeners starting from here
// Share button listener
shareButton.addEventListener("click", convertDivToImage);

//All functions starting from here
// Function to scale the poster based on window size
function scalePoster() {
	const poster = document.querySelector(".main-container");
	const baseWidth = 2000;
	const windowWidth = window.innerWidth;
	const maxDisplayWidth = windowWidth * 0.9; // 90% of window width

	const scale = Math.min(maxDisplayWidth / baseWidth, 1);

	poster.style.transform = `scale(${scale})`;
	console.log("OK");
}

// Scale poster on load and resize
window.addEventListener("load", scalePoster);
window.addEventListener("resize", scalePoster);

function editValues(domComponent, message, oldValue, localStorageName) {
	let newValue = prompt(message, oldValue !== null ? oldValue : "");

	if (newValue !== null && newValue !== "") {
		setLocalValues(localStorageName, newValue);
		domComponent.textContent = newValue;
	}
}

function getLocalValues(localStorageName) {
	let oldValue = localStorage.getItem(localStorageName);
	return oldValue;
}

function setLocalValues(localStorageName, newValue) {
	localStorage.setItem(localStorageName, newValue);
}

function convertDivToImage() {
	let imageDiv = document.querySelector(".main-container");
	html2canvas(imageDiv, { useCORS: true }).then(async (canvas) => {
		const dataUrl = canvas.toDataURL("image/png");

		if (navigator.canShare && navigator.canShare({ files: [] })) {
			try {
				const res = await fetch(dataUrl);
				const blob = await res.blob();
				const file = new File([blob], "div-snapshot.png", {
					type: "image/png",
				});

				await navigator.share({
					files: [file],
					title: "Div Snapshot",
					text: "Sharing a snapshot of the div.",
				});
			} catch (error) {
				alert("Sharing failed: " + error.message);
			}
		} else {
			// fallback to download
			const link = document.createElement("a");
			link.download = "div-snapshot.png";
			link.href = dataUrl;
			link.click();
		}
	});
}
