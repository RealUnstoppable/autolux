const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');

// The original file seems to already have renderQuotesTable. We just need to update it
// So first let's see if we messed it up by duplicating it
const renderQuotesRegex = /function renderQuotesTable\(quotes\) \{[\s\S]*?tbody\.appendChild\(row\);\n            \}\);?\n        \}/g;

const matches = content.match(renderQuotesRegex);
if (matches && matches.length > 1) {
    // Remove all matches
    content = content.replace(renderQuotesRegex, '');

    // Add it back once
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
    // Insert after renderBookingsTable
    content = content.replace(/function renderBookingsTable[\s\S]*?}\n\n/g, match => match + quoteTableScript);
} else {
    // Ensure the one existing has our new safe detail fetching
    content = content.replace(/<td>\${escapeHTML\(q\.details\)}<\/td>/g, '<td>${escapeHTML(q.details || q.vehicleDetails || \'Not specified\')}</td>');
}


fs.writeFileSync('admin.html', content);
