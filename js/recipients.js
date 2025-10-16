document.addEventListener('DOMContentLoaded', () => {
    const recipientForm = document.getElementById('recipientForm');
    const recipientTable = document.getElementById('recipientTable')?.querySelector('tbody');

    // Get and save recipients in localStorage
    const getRecipients = () => JSON.parse(localStorage.getItem('recipients') || '[]');
    const saveRecipients = (recipients) => localStorage.setItem('recipients', JSON.stringify(recipients));

    // Add recipient form
    if (recipientForm) {
        recipientForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const recipient = {
                name: document.getElementById('recipientName').value.trim(),
                need: document.getElementById('recipientNeed').value.trim(),
                contact: document.getElementById('recipientContact').value.trim()
            };

            if (!recipient.name || !recipient.need || !recipient.contact) {
                alert('Please fill in all fields.');
                return;
            }

            const recipients = getRecipients();
            recipients.push(recipient);
            saveRecipients(recipients);

            alert('Recipient added successfully!');
            recipientForm.reset();
        });
    }

    // View recipients table
    if (recipientTable) {
        const recipients = getRecipients();
        recipientTable.innerHTML = recipients.length
            ? recipients.map((r, i) =>
                `<tr>
                    <td>${i + 1}</td>
                    <td>${r.name}</td>
                    <td>${r.need}</td>
                    <td>${r.contact}</td>
                </tr>`
            ).join('')
            : `<tr><td colspan="4">No recipients found. Please add one.</td></tr>`;
    }
});
