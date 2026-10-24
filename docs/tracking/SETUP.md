# Completion tracking: setup

The website sends one message when someone's results appear: a random attempt ID.
The Apps Script in `Code.gs` writes the time (UK) and that ID to a Google Sheet.

1. Create a new Google Sheet called "GAP Profile completions".
2. Extensions > Apps Script. Delete what's there, paste `Code.gs`, save.
3. Choose `setup` in the function menu and press Run. Approve the permissions.
4. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Deploy.
5. Copy the web app URL (ends in /exec) and set `TRACKING_URL` in index.html to it.

The Summary tab shows total completions and completions in the last 7 days.
