const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');

const quoteTableScript = `
        function renderQuotesTable(quotes) {
            const tbody = document.getElementById('quotes-list-body');
            tbody.innerHTML = '';
            if(quotes.length === 0) {
                tbody.innerHTML = DOMPurify.sanitize('<tr><td colspan="4" style="text-align:center;">No quotes pending.</td></tr>'); return;
            }
            quotes.forEach(q => {
                const row = document.createElement('tr');
                const badgeClass = q.status === 'responded' ? 'active' : 'pending';
                // Handle different vehicle detail field names to be safe
                const details = q.details || q.vehicleDetails || 'Not specified';
                row.innerHTML = DOMPurify.sanitize(\`
                    <td>\${escapeHTML(q.email)}</td>
                    <td>\${escapeHTML(details)}</td>
                    <td><span class="status-badge \${badgeClass}">\${escapeHTML(q.status) || 'pending'}</span></td>
                    <td>
                        \${q.status !== 'responded' ? \`<button class="btn-sm btn-action action-btn" data-type="quote" data-action="responded" data-id="\${escapeHTML(q.id)}">Responded</button>\` : ''}
                        <button class="btn-sm btn-danger action-btn" data-type="quote" data-action="delete" data-id="\${escapeHTML(q.id)}">Delete</button>
                    </td>
                \`);
                tbody.appendChild(row);
            });
        }
`;

// Insert the renderQuotesTable function right after renderBookingsTable
content = content.replace(/function renderBookingsTable[\s\S]*?}\n\n/, match => match + quoteTableScript);

// Insert fetch for quotes
const quotesFetchScript = `
                const quotesSnap = await getDocs(query(collection(db, "quotes"), orderBy("createdAt", "desc")));
                const quotes = quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderQuotesTable(quotes);
`;

content = content.replace(/const usersSnap = await getDocs[\s\S]*?renderUsersTable\(users\);/, match => match + quotesFetchScript);


fs.writeFileSync('admin.html', content);
