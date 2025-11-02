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
	html2canvas(imageDiv, { useCORS: true }).then((canvas) => {
		// Prefer to get a Blob directly from the canvas
		canvas.toBlob(async (blob) => {
			if (!blob) {
				alert("Failed to create image blob.");
				return;
			}

			const file = new File([blob], "div-snapshot.png", {
				type: "image/png",
			});

			// If Web Share with files is supported, use it (most modern Android browsers)
			if (
				navigator.canShare &&
				navigator.canShare({ files: [file] }) &&
				navigator.share
			) {
				try {
					await navigator.share({
						files: [file],
						title: "Div Snapshot",
						text: "Sharing a snapshot of the div.",
					});
					return;
				} catch (err) {
					// Fall through to other fallbacks
					console.warn("Share with files failed:", err);
				}
			}

			// If navigator.share exists but file-sharing isn't supported, try sharing a blob URL
			if (navigator.share && typeof URL !== "undefined") {
				const blobUrl = URL.createObjectURL(blob);
				try {
					await navigator.share({
						url: blobUrl,
						title: "Div Snapshot",
						text: "Sharing a snapshot of the div.",
					});
					// revoke after a short delay to ensure the share dialog can access it
					setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
					return;
				} catch (err) {
					console.warn("Share with blob URL failed:", err);
					// revoke and fall back
					URL.revokeObjectURL(blobUrl);
				}
			}

			// Last-resort fallback: trigger a download so user can manually share the saved image
			const reader = new FileReader();
			reader.onloadend = function () {
				const dataUrl = reader.result;
				const link = document.createElement("a");
				link.download = "div-snapshot.png";
				link.href = dataUrl;
				link.click();
			};
			reader.readAsDataURL(blob);
		}, "image/png");
	});
}
