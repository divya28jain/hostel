document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const groupFile = document.getElementById('groupFile').files[0];
    const hostelFile = document.getElementById('hostelFile').files[0];

    if (groupFile && hostelFile) {
        Promise.all([readCSV(groupFile), readCSV(hostelFile)]).then(([groupData, hostelData]) => {
            const allocations = allocateRooms(groupData, hostelData);
            displayResults(allocations);
        });
    }
});

function readCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            const data = csvToArray(text);
            resolve(data);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function csvToArray(str) {
    const rows = str.trim().split('\n');
    const headers = rows[0].split(',');
    return rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((object, header, index) => {
            object[header.trim()] = values[index].trim();
            return object;
        }, {});
    });
}

function allocateRooms(groups, hostels) {
    const allocations = [];

    groups.forEach(group => {
        const hostel = hostels.find(h => h.Gender.toLowerCase() === group.Gender.toLowerCase() && parseInt(h.Capacity) >= parseInt(group.Members));
        if (hostel) {
            allocations.push({
                groupId: group['Group ID'],
                hostelName: hostel['Hostel Name'],
                roomNumber: hostel['Room Number'],
                membersAllocated: group.Members
            });
            hostel.Capacity -= group.Members;
        }
    });

    return allocations;
}

function displayResults(allocations) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Group ID</th>
                    <th>Hostel Name</th>
                    <th>Room Number</th>
                    <th>Members Allocated</th>
                </tr>
            </thead>
            <tbody>
                ${allocations.map(alloc => `
                    <tr>
                        <td>${alloc.groupId}</td>
                        <td>${alloc.hostelName}</td>
                        <td>${alloc.roomNumber}</td>
                        <td>${alloc.membersAllocated}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
