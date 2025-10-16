document.addEventListener('DOMContentLoaded', () => {
    const donorForm = document.getElementById('donorForm');
    const donorTable = document.getElementById('donorTable')?.querySelector('tbody');

    // Load donors from localStorage
    const getDonors = () => JSON.parse(localStorage.getItem('donors') || '[]');

    // Save donors back to localStorage
    const saveDonors = (donors) => localStorage.setItem('donors', JSON.stringify(donors));

    // Add donor form submission
    if (donorForm) {
        donorForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const donor = {
                name: document.getElementById('donorName').value.trim(),
                email: document.getElementById('donorEmail').value.trim(),
                phone: document.getElementById('donorPhone').value.trim()
            };

            if (!donor.name || !donor.email || !donor.phone) {
                alert('Please fill in all fields.');
                return;
            }

            const donors = getDonors();
            donors.push(donor);
            saveDonors(donors);

            alert('Donor added successfully!');
            donorForm.reset();
        });
    }

    // Display donors in table
    if (donorTable) {
        const donors = getDonors();
        donorTable.innerHTML = donors.length
            ? donors.map((d, i) =>
                `<tr>
                    <td>${i + 1}</td>
                    <td>${d.name}</td>
                    <td>${d.email}</td>
                    <td>${d.phone}</td>
                </tr>`
            ).join('')
            : `<tr><td colspan="4">No donors found. Please add one.</td></tr>`;
    }
});
