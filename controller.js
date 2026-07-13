import { db, ref, set, push, onValue, remove, DataModel } from './model.js';
import { View } from './view.js';

let currentProject = "All Projects";
let selectedMonthFilter = "All Months";
let currentUserRole = DataModel.getUserRole();

function checkAuth() {
    if (currentUserRole) {
        View.elements.loginScreen.style.display = 'none';
        View.elements.userStatus.innerText = `Role: ${currentUserRole.toUpperCase()}`;
        window.switchProject(currentProject);
    } else {
        View.elements.loginScreen.style.display = 'flex';
    }
}

window.handleLogin = function() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === 'admin' && p === '123') currentUserRole = 'admin';
    else if (u === 'user' && p === '123') currentUserRole = 'user';
    else { View.elements.errorMsg.style.display = 'block'; return; }
    
    DataModel.setUserRole(currentUserRole);
    View.elements.errorMsg.style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    checkAuth();
}

window.handleLogout = function() {
    DataModel.setUserRole(null);
    currentUserRole = null;
    checkAuth();
}

document.getElementById('menuToggle').addEventListener('click', () => {
    View.elements.sidebar.classList.toggle('active');
    View.elements.mainContent.classList.toggle('sidebar-active');
});

window.toggleDropdown = function(submenuId, headerId, defaultProj) {
    const submenu = document.getElementById(submenuId);
    const header = document.getElementById(headerId);
    const isOpen = submenu.classList.contains('open');
    
    if(isOpen) {
        submenu.classList.remove('open');
        header.classList.remove('active-header');
    } else {
        submenu.classList.add('open');
        header.classList.add('active-header');
        window.switchProject(defaultProj); 
    }
}

window.switchProject = function(projectName) {
    currentProject = projectName;
    View.elements.irFormSection.style.display = "none"; 
    View.elements.formSection.style.display = "none";
    View.elements.summaryControlsSection.style.display = "none";
    View.elements.standardFilterContainer.style.display = "inline-flex";

    if(projectName === 'Employer Summary') {
        document.getElementById('currentProjectTitle').innerText = "EMPLOYER SUMMARY REPORT";
    } else if(projectName === 'All Projects') {
        document.getElementById('currentProjectTitle').innerText = "ALL PROJECTS - DASHBOARD";
    } else if(projectName === 'Shortage Summary') {
        document.getElementById('currentProjectTitle').innerText = "SHORTAGE SUMMARY REPORT (ALL)";
    } else if(projectName === 'All IRs') {
        document.getElementById('currentProjectTitle').innerText = "ALL IR UPDATE - SECTION";
    } else if(projectName.startsWith('Shortage:')) {
        let pName = projectName.replace('Shortage: ', '');
        document.getElementById('currentProjectTitle').innerText = pName + " - SHORTAGE REPORT";
    } else if(projectName.startsWith('IR:')) {
        let pName = projectName.replace('IR: ', '');
        document.getElementById('currentProjectTitle').innerText = pName + " - IR RECORDS";
    } else {
        document.getElementById('currentProjectTitle').innerText = projectName + " - DASHBOARD";
    }
    
    document.querySelectorAll('.project-list li').forEach(li => {
        li.classList.remove('active');
        let onclickAttr = li.getAttribute('onclick') || "";
        if(onclickAttr.includes(`'${projectName}'`)) li.classList.add('active');
    });

    if(projectName === "All IRs" || projectName.startsWith("IR:")) {
        if(projectName === "All IRs" && currentUserRole === 'admin') {
            View.elements.irFormSection.style.display = "block"; 
        }
        displayIRData();
    } 
    else if(projectName === "Employer Summary" || projectName.startsWith("Shortage") || projectName === "Shortage Summary") {
        View.elements.standardFilterContainer.style.display = "none";
        View.elements.summaryControlsSection.style.display = "block";
        View.elements.filterSectionTitle.innerText = projectName === "Employer Summary" ? "Filter Employer Summary Report" : "Filter Shortage Summary Report";
        window.triggerSummaryGeneration();
    } 
    else {
        if(projectName !== "All Projects" && currentUserRole === 'admin') {
            View.elements.formSection.style.display = "block";
            View.elements.formProjectTitle.innerText = projectName;
        }
        displayData();
    }
}

window.triggerSummaryGeneration = function() {
    if(currentProject === "Employer Summary") {
        window.generateSummaryReport();
    } else if(currentProject.startsWith("Shortage") || currentProject === "Shortage Summary") {
        window.generateShortageReport();
    }
}

window.filterByMonth = function() {
    selectedMonthFilter = View.elements.monthFilterDropdown.value;
    if(currentProject === "All IRs" || currentProject.startsWith("IR:")) displayIRData();
    else displayData();
}

onValue(ref(db, 'records'), (snapshot) => {
    const data = snapshot.val();
    DataModel.databaseItems = [];
    if (data) {
        Object.keys(data).forEach(key => {
            DataModel.databaseItems.push({ id: key, ...data[key] });
        });
    }
    if(!(currentProject === "All IRs" || currentProject.startsWith("IR:"))) {
        if(currentProject === "Employer Summary" || currentProject.startsWith("Shortage") || currentProject === "Shortage Summary") window.triggerSummaryGeneration();
        else displayData();
    }
});

onValue(ref(db, 'ir_records'), (snapshot) => {
    const data = snapshot.val();
    DataModel.irDatabaseItems = [];
    if (data) {
        Object.keys(data).forEach(key => {
            DataModel.irDatabaseItems.push({ id: key, ...data[key] });
        });
    }
    if(currentProject === "All IRs" || currentProject.startsWith("IR:")) {
        displayIRData();
    }
});

function displayData() {
    View.elements.tableHeader.innerHTML = `<tr>
        <th>NO</th><th>MONTH</th><th>PROJECT</th><th>NAME</th><th>EMP NO</th><th>BONUS COUNT</th><th>SHORT AMOUNT</th><th>ACHIEVED AMOUNT</th>
        ${currentUserRole === 'admin' ? '<th>ACTION</th>' : ''}
    </tr>`;
    
    View.elements.tableBody.innerHTML = "";
    let filteredData = DataModel.databaseItems;
    if(currentProject !== "All Projects") {
        filteredData = DataModel.databaseItems.filter(item => item.project === currentProject);
    }
    if(selectedMonthFilter !== "All Months") {
        filteredData = filteredData.filter(item => item.month === selectedMonthFilter);
    }

    filteredData.forEach((emp, index) => {
        let deleteCell = currentUserRole === 'admin' ? `<td><button class="delete-btn" data-id="${emp.id}" data-type="records">Delete</button></td>` : '';
        let displayMonth = emp.month || "May"; 
        let shortVal = parseFloat(emp.shortAmount) || 0;
        let achVal = emp.achievedAmount !== undefined && emp.achievedAmount !== "" ? emp.achievedAmount + '$' : '-';
        let projName = emp.project ? emp.project.toUpperCase() : "";
        let badgeClass = "badge";

        if ((projName === "W PROJECT" || projName === "ATAS") && shortVal >= 600) badgeClass = "badge strike-red";
        else if ((projName === "KK8 - W" || projName === "KK8 - D") && shortVal >= 400) badgeClass = "badge strike-red";
        
        let row = `<tr>
            <td>${index + 1}</td>
            <td><span class="month-badge">${displayMonth}</span></td>
            <td style="font-weight:bold; color:#1f497d;">${emp.project}</td>
            <td>${emp.name || '-'}</td>
            <td>${emp.empNo || '-'}</td>
            <td>${emp.bonusCount !== undefined && emp.bonusCount !== "" ? Number(emp.bonusCount).toLocaleString() : '-'}</td>
            <td>${shortVal == 0 ? '-' : 'MYR ' + shortVal.toFixed(2)}</td>
            <td><span class="${badgeClass}">${achVal}</span></td>
            ${deleteCell}
        </tr>`;
        View.elements.tableBody.innerHTML += row;
    });
    attachDeleteEvents();
}

function displayIRData() {
    View.elements.tableHeader.innerHTML = `<tr>
        <th>NO</th><th>MONTH</th><th>PROJECT</th><th>EMPLOYEE NAME</th><th>EMP NO</th><th>IR ISSUE / REASON</th><th>AMOUNT</th><th>STATUS</th>
        ${currentUserRole === 'admin' ? '<th>ACTION</th>' : ''}
    </tr>`;
    
    View.elements.tableBody.innerHTML = "";
    let filteredIR = DataModel.irDatabaseItems;

    if(currentProject.startsWith("IR: ")) {
        let targetProj = currentProject.replace("IR: ", "");
        filteredIR = DataModel.irDatabaseItems.filter(item => item.project === targetProj);
    }

    if(selectedMonthFilter !== "All Months") {
        filteredIR = filteredIR.filter(item => item.month === selectedMonthFilter);
    }

    filteredIR.forEach((ir, index) => {
        let deleteCell = currentUserRole === 'admin' ? `<td><button class="delete-btn" data-id="${ir.id}" data-type="ir_records" style="background-color: #e74c3c; border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer;">Delete</button></td>` : '';
        let statusColor = ir.status && ir.status.toLowerCase() === 'resolved' ? '#2ecc71' : '#e67e22';
        let amtVal = parseFloat(ir.amount) ? 'MYR ' + parseFloat(ir.amount).toFixed(2) : '-';

        let row = `<tr>
            <td>${index + 1}</td>
            <td><span class="month-badge" style="background-color:#e0f2fe; color:#0369a1;">${ir.month || 'May'}</span></td>
            <td style="font-weight:bold; color:#1abc9c;">${ir.project || '-'}</td>
            <td>${ir.name || '-'}</td>
            <td>${ir.empNo || '-'}</td>
            <td style="color:#2c3e50; font-weight:500;">${ir.issue || '-'}</td>
            <td style="color:#2980b9; font-weight:600;">${amtVal}</td>
            <td><span class="badge" style="background-color: ${statusColor}; color: white; border-radius: 5px; padding: 3px 8px;">${ir.status || 'Pending'}</span></td>
            ${deleteCell}
        </tr>`;
        View.elements.tableBody.innerHTML += row;
    });

    if(filteredIR.length === 0) {
        View.elements.tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#94a3b8; padding:30px;">No IR records found for this section.</td></tr>`;
    }
    attachDeleteEvents();
}

window.generateSummaryReport = function() {
    const startM = document.getElementById('startMonth').value;
    const endM = document.getElementById('endMonth').value;
    const searchQ = document.getElementById('searchQuery').value.toLowerCase().trim();
    const startIndex = DataModel.monthOrder.indexOf(startM);
    const endIndex = DataModel.monthOrder.indexOf(endM);

    View.elements.tableHeader.innerHTML = `<tr>
        <th>NO</th><th>MONTH</th><th>PROJECT</th><th>EMP NO</th><th>EMPLOYEE NAME</th><th>BONUS COUNT</th><th>SHORT AMOUNT</th><th>ACHIEVED AMOUNT</th>
    </tr>`;
    View.elements.tableBody.innerHTML = "";

    let filtered = DataModel.databaseItems.filter(item => {
        let m = item.month || "May";
        let mIndex = DataModel.monthOrder.indexOf(m);
        let inMonthRange = startIndex <= endIndex ? (mIndex >= startIndex && mIndex <= endIndex) : (mIndex >= startIndex || mIndex <= endIndex);
        let matchesSearch = searchQ === "" || (item.name || "").toLowerCase().includes(searchQ) || (item.empNo || "").toString().includes(searchQ);
        return inMonthRange && matchesSearch;
    });

    let grandBonus = 0, grandShort = 0, grandAchieved = 0;

    filtered.forEach((item, index) => {
        let bCount = parseFloat(item.bonusCount) || 0;
        let sAmount = parseFloat(item.shortAmount) || 0;
        let aAmount = parseFloat(item.achievedAmount) || 0;
        grandBonus += bCount; grandShort += sAmount;

        let projName = item.project ? item.project.toUpperCase() : "";
        let badgeClass = "badge", isStriked = false;

        if (((projName === "W PROJECT" || projName === "ATAS") && sAmount >= 600) || ((projName === "KK8 - W" || projName === "KK8 - D") && sAmount >= 400)) {
            badgeClass = "badge strike-red"; isStriked = true;
        }
        if (!isStriked && item.achievedAmount !== undefined && item.achievedAmount !== "") grandAchieved += aAmount;

        View.elements.tableBody.innerHTML += `<tr>
            <td>${index + 1}</td>
            <td><span class="month-badge">${item.month || 'May'}</span></td>
            <td style="font-weight:bold; color:#1f497d;">${item.project || '-'}</td>
            <td>${item.empNo || '-'}</td>
            <td>${item.name || '-'}</td>
            <td>${bCount.toLocaleString()}</td>
            <td>${sAmount == 0 ? '-' : 'MYR ' + sAmount.toFixed(2)}</td>
            <td><span class="${badgeClass}">${item.achievedAmount !== undefined && item.achievedAmount !== "" ? aAmount + '$' : '-'}</span></td>
        </tr>`;
    });

    if(filtered.length > 0) {
        View.elements.tableBody.innerHTML += `<tr class="total-row">
            <td colspan="5" style="text-align: right;">GRAND TOTAL:</td>
            <td>${grandBonus.toLocaleString()}</td>
            <td>${grandShort == 0 ? '-' : 'MYR ' + grandShort.toFixed(2)}</td>
            <td><span class="badge" style="background-color:#1f497d; color:white;">${grandAchieved.toLocaleString()}$</span></td>
        </tr>`;
    }
}

window.generateShortageReport = function() {
    const startM = document.getElementById('startMonth').value;
    const endM = document.getElementById('endMonth').value;
    const searchQ = document.getElementById('searchQuery').value.toLowerCase().trim();
    const startIndex = DataModel.monthOrder.indexOf(startM);
    const endIndex = DataModel.monthOrder.indexOf(endM);

    View.elements.tableHeader.innerHTML = `<tr><th>NO</th><th>MONTH</th><th>PROJECT</th><th>NAME</th><th>EMP NO</th><th>SHORT AMOUNT</th></tr>`;
    View.elements.tableBody.innerHTML = "";

    let filtered = DataModel.databaseItems.filter(item => {
        let sAmount = parseFloat(item.shortAmount) || 0;
        if(sAmount <= 0) return false;
        if(currentProject.startsWith("Shortage: ") && item.project !== currentProject.replace("Shortage: ", "")) return false;
        let mIndex = DataModel.monthOrder.indexOf(item.month || "May");
        let inMonthRange = startIndex <= endIndex ? (mIndex >= startIndex && mIndex <= endIndex) : (mIndex >= startIndex || mIndex <= endIndex);
        return inMonthRange && (searchQ === "" || (item.name || "").toLowerCase().includes(searchQ) || (item.empNo || "").toString().includes(searchQ));
    });

    let grandShort = 0;
    filtered.forEach((item, index) => {
        let sAmount = parseFloat(item.shortAmount) || 0; grandShort += sAmount;
        View.elements.tableBody.innerHTML += `<tr>
            <td>${index + 1}</td>
            <td><span class="month-badge">${item.month || 'May'}</span></td>
            <td style="font-weight:bold; color:#1f497d;">${item.project || '-'}</td>
            <td>${item.name || '-'}</td>
            <td>${item.empNo || '-'}</td>
            <td style="color: #e74c3c; font-weight: 600;">MYR ${sAmount.toFixed(2)}</td>
        </tr>`;
    });

    if(filtered.length > 0) {
        View.elements.tableBody.innerHTML += `<tr class="total-row"><td colspan="5" style="text-align: right;">TOTAL SHORTAGE:</td><td style="color: #e74c3c;">MYR ${grandShort.toFixed(2)}</td></tr>`;
    }
}

function attachDeleteEvents() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true)); 
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type'); 
            if(confirm(`Are you sure you want to delete this record from cloud ${type === 'ir_records' ? 'IR list' : 'list'}?`)) {
                remove(ref(db, `${type}/${id}`));
            }
        });
    });
}

View.forms.dataForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (currentUserRole !== 'admin') return;
    const newRecordRef = push(ref(db, 'records'));
    set(newRecordRef, {
        month: document.getElementById('dataMonth').value || "May",
        project: currentProject,
        name: document.getElementById('empName').value || "",
        empNo: document.getElementById('empNo').value || "",
        bonusCount: document.getElementById('bonusCount').value || "",
        shortAmount: document.getElementById('shortAmount').value || "",
        achievedAmount: document.getElementById('achievedAmount').value || ""
    });
    const prevMonth = document.getElementById('dataMonth').value;
    View.clearInputs('dataForm');
    document.getElementById('dataMonth').value = prevMonth;
});

View.forms.irDataForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (currentUserRole !== 'admin') return;
    
    const irRef = push(ref(db, 'ir_records'));
    set(irRef, {
        month: document.getElementById('irMonth').value || "May",
        project: document.getElementById('irProjectSelect').value, 
        name: document.getElementById('irEmpName').value || "",
        empNo: document.getElementById('irEmpNo').value || "",
        issue: document.getElementById('irIssue').value || "",
        amount: document.getElementById('irAmount').value || "",
        status: document.getElementById('irStatus').value || "Pending"
    });

    const prevIRMonth = document.getElementById('irMonth').value;
    View.clearInputs('irDataForm');
    document.getElementById('irMonth').value = prevIRMonth;
    alert("IR Record submitted successfully in Vertical Format!");
});

checkAuth();