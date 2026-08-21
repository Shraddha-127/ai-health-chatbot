// Function to add message to chat UI
function addMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");

    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerText = text;

    chatBox.appendChild(msg);

    // Auto scroll
    chatBox.scrollTop = chatBox.scrollHeight;

    return msg;
}

// Typing animation (dots effect)
function animateTyping(element) {
    let dots = 0;
    return setInterval(() => {
        dots = (dots + 1) % 4;
        element.innerText = "Typing" + ".".repeat(dots);
    }, 400);
}

// Send message
async function sendMessage() {
    const input = document.getElementById("user-input");
    const button = document.querySelector("button");

    const text = input.value.trim();
    if (text === "") return;

    // Prevent multiple clicks
    if (button.disabled) return;

    // Show user message
    addMessage(text, "user");
    input.value = "";

    // Disable input during request
    input.disabled = true;
    button.disabled = true;

    // Show typing animation
    const loadingMsg = addMessage("Typing...", "bot");
    const typingAnimation = animateTyping(loadingMsg);

    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();

        // Stop typing animation
        clearInterval(typingAnimation);

        // Replace with actual reply
        loadingMsg.innerText = data.reply || "No response from AI 😅";

    } catch (error) {
        console.error("Error:", error);

        clearInterval(typingAnimation);
        loadingMsg.innerText = "⚠️ Server error. Please try again.";
    }

    // Enable input again
    input.disabled = false;
    button.disabled = false;
    input.focus();
}

// Enter key support
function handleKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // prevent page refresh
        sendMessage();
    }
}