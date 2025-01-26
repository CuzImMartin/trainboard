// REFRESH ACCESS TOKEN
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token stored');
    }
    const response = await fetch('https://data.cuzimmartin.dev/v1/auth/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
    });
    if (!response.ok) {
        throw new Error('Refresh request failed');
    }
    const data = await response.json();
    // data.accessToken enthält das neue kurzlebige JWT
    localStorage.setItem('accessToken', data.accessToken);
}


// LOAD DASHBOARD DATA

async function loadDashboard() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.log('Kein Access Token vorhanden – bitte bei Träwelling einloggen');
        
        return;
    }
    try {
        const response = await fetch('https://data.cuzimmartin.dev/v1/traewelling/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        if (!response.ok) {
            // Möglicherweise abgelaufen -> 401
            throw new Error(`HTTP-Error: ${response.status}`);
        }
        
        
        const data = await response.json();
        console.log('Dashboard Daten:', data);

        function extractTime(dateString) {
            const date = new Date(dateString);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        document.getElementById('twlngPopup').classList.remove('hidden');
        
        document.getElementById('twlnglinebadge').textContent = data.data[0].train.lineName;
        document.getElementById('twlngoriginStationPopup').textContent = data.data[0].train.origin.name;
        document.getElementById('twlngdestinationStationPopup').textContent = data.data[0].train.destination.name;
        document.getElementById('twlngtripDurationTime').innerHTML = (`${data.data[0].train.duration} min.`);
        document.getElementById('twlngoriginTime').textContent = extractTime(data.data[0].train.origin.departure);
        document.getElementById('twlngdestinationTime').textContent = extractTime(data.data[0].train.destination.arrival);
        document.getElementById("twlngpopuplink").href = `trip.html?tripId=${encodeURIComponent(data.data[0].train.hafasId)}&?stationID=${data.data[0].train.origin.evaIdentifier}`;


    } catch (error) {
        console.error(error);
        // wenn 401 dann wird die refresh funktion aufgerufen
        await refreshAccessToken();
        
    }
}

loadDashboard();