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

meetingTimeElement.addEventListener("click", () => {
	let message = "പൊതുയോഗ സമയം തിരുത്തുക";
	editValues(meetingTimeElement, message, "meetingTime"); // meetingTime is Local Storage Name
});

createDateElement.addEventListener("click", () => {
	let message = "തീയതി തിരുത്തുക";
	editValues(createDateElement, message, "createDate"); // createDate is Local Storage Name
});

agendaElement.addEventListener("click", () => {
	let message = "അജണ്ട തിരുത്തുക";
	editValues(agendaElement, message, "localAgenda"); // createDate is Local Storage Name
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
}

// Scale poster on load and resize
window.addEventListener("load", scalePoster);
window.addEventListener("resize", scalePoster);

// Function to edit values from the tab and save to local storage
function editValues(domComponent, label, localStorageName) {
	const dataTab = document.getElementById("input-area");
	const dataLabel = document.getElementById("data-label");
	const textArea = document.getElementById("data-input");
	const updateButton = document.getElementById("update-button");
	const cancelButton = document.getElementById("cancel-button");
	const normalAgenda = "പ്രതിമാസ കരയോഗം നടപടികൾ, മറ്റ് അത്യാവശ്യകാര്യങ്ങൾ";
	let oldValue =
		getLocalValues(localStorageName) === null
			? ""
			: getLocalValues(localStorageName);

	if (localStorageName === "localAgenda" && oldValue === "") {
		oldValue = normalAgenda;
	}

	dataLabel.textContent = label;
	textArea.value = oldValue !== null ? oldValue : "";
	dataTab.style.display = "block";

	updateButton.onclick = function () {
		let newValue = textArea.value;
		if (newValue !== null && newValue !== "") {
			setLocalValues(localStorageName, newValue);
			domComponent.textContent = newValue;
		}
		dataTab.style.display = "none";
	};

	cancelButton.onclick = function () {
		dataTab.style.display = "none";
	};
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
