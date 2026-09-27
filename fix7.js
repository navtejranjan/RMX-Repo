const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const replacementBlock = `
    function processReconciliationData(rejData, handData, selectedDate, selectedEndDate) {
        summaryLoading.style.display = "none";
        resetApplyBtn();

        if (!rejData || !handData || rejData.status !== "success" || handData.status !== "success") {
            noDataMessage.style.display = "block";
            noDataMessage.innerHTML = \`<i class="fas fa-inbox"></i><p>Failed to fetch one or both datasets.</p>\`;
            return;
        }

        let dateDisplay = selectedDate || "All Dates";
        if (selectedDate && selectedEndDate && selectedDate !== selectedEndDate) {
            dateDisplay = \`\${selectedDate} to \${selectedEndDate}\`;
        } else if (selectedEndDate && !selectedDate) {
            dateDisplay = selectedEndDate;
        }

        // Filter Rejection Rows
        const rejRows = (rejData.data || []).filter(row => {
            const rowDate = row[COL_REJECTION.DATE];
            let rowDateStr = '';
            if (rowDate) {
                const d = new Date(rowDate);
                if (!isNaN(d.getTime())) {
                    rowDateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                }
            }
            if (selectedDate && selectedEndDate) {
                return rowDateStr >= selectedDate && rowDateStr <= selectedEndDate;
            } else if (selectedDate) {
                return rowDateStr === selectedDate;
            } else if (selectedEndDate) {
                return rowDateStr === selectedEndDate;
            }
            return true;
        });

        // Filter Handover Rows
        const handRows = (handData.data || []).filter(row => {
            const rowDate = row[COL_HANDOVER.DATE];
            let rowDateStr = '';
            if (rowDate) {
                const d = new Date(rowDate);
                if (!isNaN(d.getTime())) {
                    rowDateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                }
            }
            if (selectedDate && selectedEndDate) {
                return rowDateStr >= selectedDate && rowDateStr <= selectedEndDate;
            } else if (selectedDate) {
                return rowDateStr === selectedDate;
            } else if (selectedEndDate) {
                return rowDateStr === selectedEndDate;
            }
            return true;
        });

        if (rejRows.length === 0 && handRows.length === 0) {
            noDataMessage.style.display = "block";
            noDataMessage.innerHTML = \`<i class="fas fa-inbox"></i><p>No data found in either system for \${dateDisplay}.</p>\`;
            return;
        }

        const rejTotals = {
            cell: 0, ribbon: 0, busbar: 0, rtv: 0,
            frameL: 0, frameS: 0, potting: 0,
            jbPos: 0, jbNeg: 0, jbMid: 0,
            fgWeight: 0, fgNos: 0, bgWeight: 0, bgNos: 0, epe: 0
        };

        const handTotals = {
            cell: 0, ribbon: 0, busbar: 0, rtv: 0,
            frameL: 0, frameS: 0, potting: 0,
            jbPos: 0, jbNeg: 0, jbMid: 0,
            fgWeight: 0, fgNos: 0, bgWeight: 0, bgNos: 0, epe: 0
        };
`;

const regex = /    function processReconciliationData\([\s\S]*?fgWeight: 0, fgNos: 0, bgWeight: 0, bgNos: 0, epe: 0\s*\n        \};/m;

code = code.replace(regex, replacementBlock.trim());

const strayDateDisplayRegex = /        let dateDisplay = selectedDate \|\| "All Dates";[\s\S]*?dateDisplay = selectedEndDate;\n        \}/;
code = code.replace(strayDateDisplayRegex, '');

fs.writeFileSync('script.js', code);
console.log('Fixed processReconciliationData block completely!');

