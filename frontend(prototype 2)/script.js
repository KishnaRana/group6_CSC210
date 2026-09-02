const ahmedabadCoords = [23.0225, 72.5714];
const map = L.map('map').setView(ahmedabadCoords, 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors | AMC Water Division'
}).addTo(map);

let complaintQueue = [];

let complaintIdCounter = 1;
let activeMarkers = [];
let temporaryMarker = null;


function calculatePriorityScore(severity, affectedPop) {
    const w1 = 0.6; // Severity weight
    const w2 = 0.4; // Affected population weight
    return (severity * w1) + ((affectedPop / 100) * w2);
}

map.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(4);
    const lng = e.latlng.lng.toFixed(4);

    document.getElementById('coords').value = `${lat}, ${lng}`;

    if (temporaryMarker) {
        map.removeLayer(temporaryMarker);
    }

    temporaryMarker = L.marker([lat, lng]).addTo(map)
        .bindPopup("<b>Selected Leak Location</b><br>Submit form to confirm.")
        .openPopup();
});

function refreshDashboard() {

    complaintQueue.forEach(c => {
        c.score = calculatePriorityScore(c.severity, c.affectedPop).toFixed(2);
    });


    complaintQueue.sort((a, b) => b.score - a.score);

    const tableBody = document.getElementById('queueTableBody');
    tableBody.innerHTML = '';

    complaintQueue.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${item.id}</td>
            <td>${item.area}</td>
            <td>${item.issue}</td>
            <td><strong>${item.severity}</strong></td>
            <td>${item.affectedPop}</td>
            <td><span style="color: #0077b6; font-weight: bold;">${item.score}</span></td>
        `;
        tableBody.appendChild(row);
    });

    activeMarkers.forEach(marker => map.removeLayer(marker));
    activeMarkers = [];

    complaintQueue.forEach(c => {
        const color = c.severity >= 4 ? '#d90429' : (c.severity >= 3 ? '#f77f00' : '#0284c7');

        const circle = L.circleMarker([c.lat, c.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: 8 + (c.severity * 2) // Larger circle for critical complaints
        }).addTo(map);

        circle.bindPopup(`
            <b>Complaint #${c.id} - ${c.area}</b><br>
            Issue: ${c.issue}<br>
            Severity: ${c.severity}/5<br>
            Priority Score: <b>${c.score}</b>
        `);

        activeMarkers.push(circle);
    });
}

document.getElementById('complaintForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const coords = document.getElementById('coords').value.split(',');
    if (coords.length < 2) {
        alert("Please click on the Ahmedabad map to choose a location first.");
        return;
    }

    const newComplaint = {
        id: complaintIdCounter++,
        area: document.getElementById('zone').value,
        lat: parseFloat(coords[0]),
        lng: parseFloat(coords[1]),
        issue: document.getElementById('issueType').value,
        severity: parseInt(document.getElementById('severity').value),
        affectedPop: parseInt(document.getElementById('affectedPop').value),
        score: 0
    };

    complaintQueue.push(newComplaint);

    if (temporaryMarker) {
        map.removeLayer(temporaryMarker);
        temporaryMarker = null;
    }

    refreshDashboard();
    this.reset();
    document.getElementById('coords').value = "";
});

document.getElementById('coords').value = "23.0365, 72.5611";

refreshDashboard();