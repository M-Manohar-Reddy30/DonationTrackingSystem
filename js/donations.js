document.addEventListener('DOMContentLoaded', () => {
    const donationForm = document.getElementById('donationForm');
    const donationTable = document.getElementById('donationTable')?.querySelector('tbody');
    const donorSelect = document.getElementById('donorSelect');
    const recipientSelect = document.getElementById('recipientSelect');

    const getDonors = () => JSON.parse(localStorage.getItem('donors') || '[]');
    const getRecipients = () => JSON.parse(localStorage.getItem('recipients') || '[]');
    const getDonations = () => JSON.parse(localStorage.getItem('donations') || '[]');
    const saveDonations = (donations) => localStorage.setItem('donations', JSON.stringify(donations));

    // Populate dropdowns
    if (donorSelect && recipientSelect) {
        const donors = getDonors();
        const recipients = getRecipients();

        donorSelect.innerHTML = donors.length
            ? donors.map(d => `<option value="${d.name}">${d.name}</option>`).join('')
            : `<option disabled>No donors found</option>`;

        recipientSelect.innerHTML = recipients.length
            ? recipients.map(r => `<option value="${r.name}">${r.name}</option>`).join('')
            : `<option disabled>No recipients found</option>`;
    }

    // Add donation form logic
    if (donationForm) {
        donationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const donation = {
                donor: donorSelect.value,
                recipient: recipientSelect.value,
                amount: document.getElementById('donationAmount').value.trim(),
                date: document.getElementById('donationDate').value
            };

            if (!donation.donor || !donation.recipient || !donation.amount || !donation.date) {
                alert('Please fill all fields.');
                return;
            }

            const donations = getDonations();
            donations.push(donation);
            saveDonations(donations);

            alert('Donation recorded successfully!');
            donationForm.reset();
        });
    }

    // Display donations in table
    if (donationTable) {
        const donations = getDonations();
        donationTable.innerHTML = donations.length
            ? donations.map((d, i) =>
                `<tr>
                    <td>${i + 1}</td>
                    <td>${d.donor}</td>
                    <td>${d.recipient}</td>
                    <td>₹${d.amount}</td>
                    <td>${d.date}</td>
                </tr>`
            ).join('')
            : `<tr><td colspan="5">No donations found. Please add one.</td></tr>`;
    }
});
