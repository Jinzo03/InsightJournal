# InsightJournal 

A modern, AI-powered personal journaling application built with **FastAPI** and **Vanilla JS**. Insight Journal allows users to track their daily thoughts, monitor mood trends, and visualize their emotional journey through an interactive dashboard.

![Dashboard Screenshot]("C:\Users\iyedd\OneDrive\Pictures\Screenshots\Screenshot (102).png")

## 🚀 Features

### Backend (FastAPI)
* **High Performance:** Built on FastAPI for lightning-fast responses.
* **Complete CRUD:** Full support to **C**reate, **R**ead, **U**pdate, and **D**elete journal entries.
* **RESTful API:** Clean API architecture serving JSON data to the frontend.
* **Data Validation:** Robust input validation using Pydantic models.

### Frontend (HTML/CSS/JS)
* **Responsive Design:** Fully responsive layout (CSS Grid/Flexbox) that adapts from Desktop to Mobile.
* **Interactive Charts:** Mood trends visualized using **Chart.js**.
* **Dark Mode:** A sleek, modern dark theme designed for comfortable evening writing.
* **Dynamic UI:** Real-time DOM manipulation for a seamless user experience without page reloads.

## 🛠️ Tech Stack

* **Backend:** Python 3.10+, FastAPI, Uvicorn
* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Libraries:** Chart.js (Visualization), Pydantic (Validation)

## 📦 Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/insight-journal.git](https://github.com/YOUR_USERNAME/insight-journal.git)
cd insight-journal 
$exit
```
### 2. Create a Virtual Environment
It's recommended to use a virtual environment to keep dependencies clean.
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
Start the FastAPI server using Uvicorn.
```bash
uvicorn main:app --reload
```
The application will be available at ```
http://127.0.0.1:8000. ```

### Usage
* **Dashboard:** View your "Average Mood" and "AI Score" at a glance.

* **Write:** Type your entry in the main text area, select a mood score (1-10), and hit Save.

* **Track:** Watch the chart update automatically with your new data.

* **Edit/Delete:** Made a typo? Click the ✏️ icon to edit or the 🗑️ icon to remove an entry permanently.

* **Search:** Use the search bar to filter through past memories instantly.

### Project Structure
```bash
📂 insight-journal
├── 📂 static
│   ├── app.js        # Frontend Logic (API calls, UI updates)
│   └── style.css     # Responsive Styling
├── 📂 templates
│   └── index.html    # Main Dashboard UI
├── main.py           # FastAPI Backend & Routes
├── requirements.txt  # Python Dependencies
└── README.md         # Project Documentation
```
### Future Improvements
* [ ] Integration with a persistent database (SQLite/PostgreSQL).

* [ ] User Authentication (Login/Register).

* [ ] Advanced AI Sentiment Analysis using NLP.

### License
This project is open-source and available under the MIT License.
