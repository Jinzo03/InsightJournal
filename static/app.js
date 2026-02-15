let allEntries =[]; //This hols all the data to be filtered later
let myChart = null; // Variable to store the chart instance
// Select the elements
// We use'document.getElementById' to find the HTML tags we created in index.html
const saveBtn = document.getElementById('save-btn');
const journalText = document.getElementById('journal-text');
const moodScore = document.getElementById('mood-score');

// Export Button Logic
document.getElementById('export-btn').addEventListener('click', function() {
    // This simply redirects the browser to the download link
    window.location.href = '/api/export';
})
// STEP 2: Add an event listener to the button
// This waits for the user to click.It's like a sensor waiting for a signal.
saveBtn.addEventListener('click', async function() {
    //1. PACKAGE THE DATA
    const payload = {
        content: journalText.value,
        mood: parseInt(moodScore.value) // We must convert text "5" to number 5
    };
    
    //2. SEND THE TRUCK (Fetch API)
    // We use 'await' because the internet (even localhost) takes time
    try {
        const response= await fetch('/api/create_entry', {
            method: 'POST', // We are SENDING data
            headers: {
                'Content-Type': 'application/json' // Label the package
            },
            body: JSON.stringify(payload) // Convert JS object to JSON string
        });
    //3. CHECK RECEIPT
    const data=await response.json(); // Read the server's response  
    console.log('Server replied:', data); 
    loadEntries(); // Refresh the entries list
    
    // Visual feedback to user
    document.getElementById('save-status').innerText = "Saved successfully!";
    document.getElementById('save-status').style.color = "green";

    } catch (error) {
        console.error('Error sending data:', error);
        document.getElementById('save-status').innerText = "Failed to save.";
        document.getElementById('save-status').style.color = "red";
    }
});   

// Load and Display Entries

async function loadEntries() {
    // 1. Fetch the data from Python
    const response = await fetch('/api/entries');

    // 2. Save to our Global Variable
    allEntries = await response.json();

    // 3. Draw the data
    renderChart(allEntries);
    renderList(allEntries); 
    updateStats(allEntries);
}

// Takes a list of entries and paints them on the screen
function renderList(entries){
    const list = document.getElementById('entries-list');

    list.innerHTML = ''; // Clear the old list before adding new items (important for search)
    // If the list is empty (search found nothing), show a message
    if (entries.length === 0){
        list.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No entries found.</p>';
        return;
    }
    entries.forEach(entry => {
        // Create a new bullet point
        const li = document.createElement('li');
        li.id = `entry-${entry.id}`; // We need JS to know exactly which white box on the screen to change
        // Check For Anomaly
        const anomalyLabel = checkAnomaly(entry.mood, entry.sentiment);

        //If an anomaly exists, add the special styling class
        if (anomalyLabel){
            li.classList.add('anomaly-card');
        }

        // 1. Format the date
        // We create a new date object from the database string
        const dateObj = new Date(entry.created_at);
        // Convert to readable string (e.g., "10/5/2023", 2:30 PM")
        const dateString = dateObj.toLocaleString();
        // Text is wrapped in a safety bubble
        const safeContent = encodeURIComponent(entry.content);
        // 2. Create a prettier card
        // We use <strong> to make labels bold
        li.innerHTML= `
            <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: var(--text-muted); margin-bottom: 8px;">
                <span>${dateString} ${anomalyLabel ? `<span class="anomaly-badge">${anomalyLabel}</span>` : ''}</span>
                
                <div>
                    <button onclick="enableEditMode(${entry.id}, '${safeContent}', ${entry.mood})" 
                        style="background: none; border: none; cursor: pointer; margin-right: 5px; opacity: 0.7;">✏️</button>
                    <button onclick="deleteEntry(${entry.id})" 
                        style="background: none; border: none; cursor: pointer; opacity: 0.7;">🗑️</button>
                </div>
            </div>
            
            <div id="view-mode-${entry.id}">
                <div style="margin-bottom: 5px; font-weight: bold; color: var(--accent);">
                    Mood: ${entry.mood} <span style="color: var(--text-muted); font-weight: normal; font-size: 0.9em;">| AI: ${entry.sentiment.toFixed(2)}</span>
                </div>
                <p style="line-height: 1.5; color: var(--text-main);">${entry.content}</p>
            </div> `;    

        // Set the text inside it
        // We use .toFixed(2) to round values to 2 decimal places for better readability.

        // Add it to the list
        list.appendChild(li);
    });
}

function renderChart(entries) {
    const ctx = document.getElementById('moodChart').getContext('2d');

    // 1. Prepare the Data Lists (Arrays)
    // We map the database entries into simple lists of numbers
    const labels = entries.map(e => new Date(e.created_at).toLocaleDateString());
    const userMoods = entries.map(e => e.mood);
    const aiScores = entries.map(e => e.sentiment);

    // 2. Destroy old chart if it exists (prevents glitching)
    if (myChart) {
        myChart.destroy();
    }
    Chart.defaults.color = '#94a3b8';     // Muted Text
    Chart.defaults.borderColor = '#334155'; // Slate Grid

    // 3. Create the New Chart
    myChart = new Chart(ctx, {
        type: 'line', // Line graph
        data: {
            labels: labels, // X-Axis (ID 1, ID 2...)
            datasets: [
                {
                    label: 'My Mood (1-10)',
                    data: userMoods,
                    borderColor: '#6366f1', // Indigo
                    tension: 0.4, // Smooth curves
                    yAxisID: 'y', // Uses Left Axis
                },
                {
                    label: 'AI Sentiment (-1 to 1)',
                    data: aiScores,
                    borderColor: '#22c55e',
                    tension: 0.4,
                    yAxisID: 'y1', // Uses Right Axis
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    max: 10
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: -1,
                    max: 1,
                    grid: {
                        drawOnChartArea: false // Keep grid clean
                    }
                }
            }
        }
    });
}

function updateStats(entries){
    // 1. Calculate total Entries
    const total = entries.length;

    // 2. Calculate Average Mood (user)
    // We use 'reduce' to sum up all the numbers in an array.
    // 'acc' is the accumulator (running total), 'curr' is the current entry.
    // The 0 at the end is the starting value
    let sumMood = entries.reduce((acc,  curr) => acc + curr.mood,0);
    let avgMood = total > 0 ? (sumMood / total).toFixed(1) : 0;

    // 3. Calculate Average Sentiment (AI)
    let sumAi = entries.reduce((acc,  curr) => acc + curr.sentiment,0);
    let avgAi = total > 0 ? (sumAi / total).toFixed(2) : 0;

    // 4. Update the HTML
    const moodEl = document.getElementById('stat-mood');
    const aiEl = document.getElementById('stat-ai');

    document.getElementById('stat-total').innerText = total;
    moodEl.innerText = avgMood;
    aiEl.innerText = avgAi;

    // 5. Apply "Smart Colors" (Conditional Formatting)

    // --- Logic For Mood (Scale 1-10) ---
    // Remove old classes first so colors don't get stuck
    moodEl.classList.remove('score-green', 'score-yellow', 'score-red');

    if (avgMood >= 7){
        moodEl.classList.add('score-green'); // Happy
    }else if (avgMood >= 4){
        moodEl.classList.add('score-yellow'); // Okay
    } else {
        moodEl.classList.add('score-red'); // Sad
    }
   
    // --- Logic for AI (Scale -1 to 1) ---
    aiEl.classList.remove('score-green', 'score-yellow', 'score-red');

    if (avgAi >= 0.2) {
        aiEl.classList.add('score-green'); // Positive
    } else if (avgAi >= -0.2){
        aiEl.classList.add('score-yellow'); // Neutral
    } else{
        aiEl.classList.add('score-red'); // Negative
    }
}
function checkAnomaly(mood, sentiment){
    // 1. "Hidden Sadness"
    // User says they are happy (>7), but AI detects negative text (< -0.2)
    if (mood >= 7 && sentiment < -0.2){
        return "Masking?";
    }
    // 2. "Hidden Positivity"
    // User says they are sad (<4, but AI detects positive text (> 0.2)
    if (mood <= 4 && sentiment > 0.2){
        return "Over-Critical";
    }

    // No anomaly found
return null;
}
// Search logic

// 1. Find the search bar
const searchInput = document.getElementById('search-bar');

// 2. Listen for typing (The 'input' event fires every time a key is pressed)
searchInput.addEventListener('input' , (e) => {

    // A. Get what the user typed and make it lowercase
    const searchTerm = e.target.value.toLowerCase();

    // B. The Fimter: Create a new list based on the search
    const filteredEntries = allEntries.filter(entry => {
        // We look inside the 'content' of the entry
        const content = entry.content.toLowerCase();

        // Does the content include the search term ? (True or False)
        return content.includes(searchTerm);
    });

    // C. Update the Screen the new list
    renderList(filteredEntries); // Update the bullets
    renderChart(filteredEntries); // Update the graph lines
    updateStats(filteredEntries); // Update the dashboard numbers
});


// AI THERAPIST LOGIC

// 1. Find the HTML elements

const analyzeBtn = document.getElementById('analyze-btn');
const adviceText = document.getElementById('ai-advice');

// 2. Add the click listener
analyzeBtn.addEventListener('click', async() => {

    //UI Polish: Change the button text so the user knows it's working
    analyzeBtn.innerText = "Thinking...";
    analyzeBtn.disabled = true; // Stop them from clicking twice

    try {
        // 3. Call the Python API
        const response = await fetch ('/api/analyze_week');

        // 4. Convert the answer to JSON
        const data = await response.json();

        // 5. Show the result
        // We set the text of the hidden paragraph...
        adviceText.innerText = data.advice;
        // and make it visible (change display from 'none' to 'block')
        adviceText.style.display = 'block';
    } catch (error) {
        console.error("AI Error:", error);
        adviceText.innerText = "Sorry can't fetch right now. "
        adviceText.style.display = 'block';
    }

    // 6. Reset the button
    analyzeBtn.innerText = "✨ Analyze Week";
    analyzeBtn.disabled = false;
});

// Delete Logic
async function deleteEntry(id) {
    // 1. Confirm with the suer
    if (!confirm("Are you sure you want to delete this entry?")) {
        return;
    }

    try {
        // 2. Send the DELETE command to Python
        // Notice we stick the ID at the end of the URL
        const response = await fetch(`/api/entries/${id}`, {
            method: 'DELETE'
        });

        // 3. Refresh the list to show it's gone
        if (response.ok) {
            loadEntries(); // This reloads the list from scratch
        } else {
            alert("Failed to delete.");
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}
async function saveEdit(id) {
    // 1. Find the inputs we created in Piece 2
    const newMoodInput = document.getElementById(`edit-mood-${id}`);
    const newContentInput = document.getElementById(`edit-content-${id}`);

    // 2. Get the values inside them
    const newMood = parseInt(newMoodInput.value, 10);
    const newContent = newContentInput.value.trim();

    if (Number.isNaN(newMood) || !newContent) {
        alert("Please provide valid mood and content.");
        return;
    }

    try {
        // 3. Send the data to Python
        // We use method: 'PUT' because we are updating
        const response = await fetch(`/api/entries/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                content: newContent,
                mood: newMood // Make sure mood is a number not a text
            })
        });

        // 4. If it worked
       if (response.ok) {
            loadEntries();
            return;
        } else {
            alert("Failed to update.");
        }
    } catch (error) {
        console.error("Update error", error);
    }
}
  function cancelEdit(id) {
    // 1. Remove the edit form (Destroy the inputs)
    document.getElementById(`edit-mode-${id}`).remove();

    // 2. Show the original text again
    document.getElementById(`view-mode-${id}`).style.display = 'block';
  }
function enableEditMode(id, encodedContent, currentMood) {
    // 1. Decode the text
    // We take the safe version (Hello%20World) and turn it back to human text
    const content = decodeURIComponent(encodedContent);


    // 2. Find the specific card using the ID set in Piece 1
    const li = document.getElementById(`entry-${id}`);

    // 3. Find the text container using the ID set in Piece 1
    const viewDiv = document.getElementById(`view-mode-${id}`);

    // 4.  Hide the text
    viewDiv.style.display = 'none';

    // 5. Create the "Edit Form"
    // This is a new div that holds the input boxes
    const editForm = document.createElement('div');
    editForm.id = `edit-mode-${id}` // It is named so we can remove it later

    // 6. Fill the form with HTML
    // We set the 'value' of the inputs to match the current data
    editForm.innerHTML = `
    <div style="margin-top: 10px; background: var(--bg-input); padding: 10px; border-radius: 8px;">
        <div style="margin-bottom: 5px;">
            <label style="color: var(--text-muted); font-size: 0.9em;">Mood:</label>
            <input type="number" id="edit-mood-${id}" value="${currentMood}" min="1" max="10" style="width: 60px;">
        </div>
        <textarea id="edit-content-${id}" style="width: 100%; height: 80px; margin-top: 5px;">${content}</textarea>

        <div style="margin-top: 10px; text-align: right">
            <button onclick="cancelEdit(${id})" style="background: transparent; border: 1px solid var(--text-muted); padding: 5px 10px; border-radius: 6px; color: var(--text-muted); cursor: pointer; margin-right: 5px;">Cancel</button>
            <button onclick="saveEdit(${id})" style="background-color: var(--success); color:white; border:none; padding: 5px 15px; border-radius: 6px; cursor: pointer;">Save</button>
        </div>
    </div>
    `;

    // 7. Inject the form into the card
    li.appendChild(editForm);
}   
// Initial Load 
loadEntries();