let prompt=document.querySelector("#prompt")
let chatContainer=document.querySelector(".chat-container")

let user={
    data :null,
}
async function searchCollegeData(question) {
    try {
        const res = await fetch('college-data.json');
        const data = await res.json();

        let result = data.find(entry =>
            question.toLowerCase().includes(entry.topic.toLowerCase())
        );

        return result ? result.content : null;
    } catch (err) {
        console.error("Error reading college-data.json:", err);
        return null;
    }
}

// Generate AI response
async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    // Search for local match
    const matchedData = await searchCollegeData(user.data);

    // Construct prompt
    let promptText = matchedData
        ? `Answer the question using ONLY the following college info:\n\n${matchedData}\n\nQuestion: ${user.data}`
        : user.data;

    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: promptText }]
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        text.innerHTML = apiResponse;
    } catch (error) {
        console.error("Gemini API Error:", error);
        text.innerHTML = "Something went wrong!";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    }
}

// Helper to create chat box
function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

// Handle user input
function handlechatResponse(message) {
    user.data = message;

    let html = `<div class="user-chat-area">${user.data}</div>`;
    prompt.value = "";

    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let aiHtml = `<div class="ai-chat-area"><img src="loading2.webp" alt="Loading..." class="load" width="100px"></div>`;
        let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 100);
}

// Listen to "Enter" key
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && prompt.value.trim() !== "") {
        handlechatResponse(prompt.value);
    }
});

