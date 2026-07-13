export const View = {
    elements: {
        loginScreen: document.getElementById('loginScreen'),
        userStatus: document.getElementById('userStatus'),
        errorMsg: document.getElementById('errorMsg'),
        formSection: document.getElementById('formSection'),
        irFormSection: document.getElementById('irFormSection'),
        formProjectTitle: document.getElementById('formProjectTitle'),
        tableBody: document.getElementById('tableBody'),
        tableHeader: document.getElementById('tableHeader'),
        sidebar: document.getElementById('sidebar'),
        mainContent: document.getElementById('mainContent'),
        monthFilterDropdown: document.getElementById('monthFilter'),
        standardFilterContainer: document.getElementById('standardFilterContainer'),
        summaryControlsSection: document.getElementById('summaryControlsSection'),
        filterSectionTitle: document.getElementById('filterSectionTitle')
    },
    forms: {
        dataForm: document.getElementById('dataForm'),
        irDataForm: document.getElementById('irDataForm')
    },
    clearInputs(formId) {
        document.getElementById(formId).reset();
    }
};