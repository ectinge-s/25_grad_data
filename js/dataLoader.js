// Global data objects
let programsData = []; 
let programsFoSData = [];
let fosCareerData = [];

// Function to load all CSV data
async function loadAllData() {
    try {
        // Load program data
        const programsResponse = await fetch('/25_grad_data/data/250318/1_programs.csv');
        const programsText = await programsResponse.text();
        programsData = parseCSV(programsText);
        
        // Load program-FoS mapping
        const programsFoSResponse = await fetch('/25_grad_data/data/250318/2_programs_fos.csv');
        const programsFoSText = await programsFoSResponse.text();
        programsFoSData = parseCSV(programsFoSText);
        
        // Load FoS-Career mapping
        const fosCareerResponse = await fetch('/25_grad_data/data/250318/3_fos_career.csv');
        const fosCareerText = await fosCareerResponse.text();
        fosCareerData = parseCSV(fosCareerText);
        
        console.log('All data loaded successfully', programsData, programsFoSData, fosCareerData);
        
        // Initialize UI elements based on current page
        initializeUIForCurrentPage();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Parse CSV text into array of objects
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Handle CSV parsing with potential quotes
        const values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // Add the last value
        values.push(currentValue);
        
        // Create object from headers and values
        const row = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j] ? values[j].trim() : '';
        }
        
        results.push(row);
    }
    
    return results;
}

// Initialize UI elements based on current page
function initializeUIForCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'filter-by-school.html' || currentPage === '') {
        initializeSchoolFilter();
    } else if (currentPage === 'filter-by-fos.html') {
        initializeFoSFilter();
    } else if (currentPage === 'filter-by-career.html') {
        initializeCareerFilter();
    }
}

// Initialize the school filter page
function initializeSchoolFilter() {
    // Extract unique schools
    const schools = [...new Set(programsData.map(p => p['目标院校']))].filter(Boolean);
    
    const checkboxContainer = document.getElementById('school-checkboxes');
    if (!checkboxContainer) return;

    schools.forEach(school => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `school-${school.replace(/\s+/g, '')}`;
        checkbox.value = school;
        
        const label = document.createElement('label');
        label.htmlFor = `school-${school.replace(/\s+/g, '')}`;
        label.textContent = school;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        checkboxContainer.appendChild(div);
    });
    
    // Add event listener to filter button
    const filterBtn = document.getElementById('filter-school-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', filterBySchool);
    }
}

// Initialize the FoS filter page
function initializeFoSFilter() {
    // Extract Fields of Study from programsFoSData
    const fosSet = new Set();
    
    // Find the headers
    let primaryHeader = "";
    let secondaryHeader = "";
    
    if (programsFoSData.length > 0) {
        const headers = Object.keys(programsFoSData[0]);
        primaryHeader = headers.find(h => h.includes("主要对口科系"));
        secondaryHeader = headers.find(h => h.includes("次要可行科系"));
    }
    
    // Use the found headers or fall back to the expected ones
    const primaryFieldName = primaryHeader || "主要对口科系（符合专业主要学术方向）";
    const secondaryFieldName = secondaryHeader || "次要可行科系（申请材料与作品集中必须向该专业主要学术方向靠拢，或体现相关技能与认知）";
    
    // Extract all FoS from primary and secondary fields
    programsFoSData.forEach(program => {
        // Process primary FoS
        const primaryFoS = program[primaryFieldName];
        if (primaryFoS) {
            // Split by both Chinese and English commas
            const primaryFosList = primaryFoS.split(/[,，]/);
            primaryFosList.forEach(fos => {
                const trimmedFoS = fos.trim();
                if (trimmedFoS) fosSet.add(trimmedFoS);
            });
        }
        
        // Process secondary FoS
        const secondaryFoS = program[secondaryFieldName];
        if (secondaryFoS) {
            // Split by both Chinese and English commas
            const secondaryFosList = secondaryFoS.split(/[,，]/);
            secondaryFosList.forEach(fos => {
                const trimmedFoS = fos.trim();
                if (trimmedFoS) fosSet.add(trimmedFoS);
            });
        }
    });
    
    // Also add FoS from fosCareerData
    fosCareerData.forEach(item => {
        const fos = item['科系'];
        if (fos) {
            // Split by both Chinese and English commas in case this also has multiple values
            const fosList = fos.split(/[,，]/);
            fosList.forEach(f => {
                const trimmedFoS = f.trim();
                if (trimmedFoS) fosSet.add(trimmedFoS);
            });
        }
    });
    
    // Convert to array and sort
    const allFoS = [...fosSet].sort();
    console.log("Available Fields of Study:", allFoS);
    
    // Populate dropdown
    const dropdown = document.getElementById('fos-dropdown');
    if (!dropdown) return;

    allFoS.forEach(fos => {
        const option = document.createElement('option');
        option.value = fos;
        option.textContent = fos;
        dropdown.appendChild(option);
    });
    
    // Add event listener to dropdown
    dropdown.addEventListener('change', filterByFoS);
}

// Initialize the career filter page
function initializeCareerFilter() {
    // Extract all careers from fosCareerData
    const careers = [];
    fosCareerData.forEach(item => {
        const careerDirections = item['未来发展方向'];
        if (careerDirections) {
            // Split by common separators
            const careerList = careerDirections.split(/[,，、;；\/\|]/);
            careerList.forEach(career => {
                const trimmedCareer = career.trim();
                if (trimmedCareer && !careers.includes(trimmedCareer)) {
                    careers.push(trimmedCareer);
                }
            });
        }
    });
    
    // Sort careers
    careers.sort();
    
    // Populate checkboxes
    const checkboxContainer = document.getElementById('career-checkboxes');
    if (!checkboxContainer) return;

    careers.forEach(career => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `career-${career.replace(/\s+/g, '')}`;
        checkbox.value = career;
        
        const label = document.createElement('label');
        label.htmlFor = `career-${career.replace(/\s+/g, '')}`;
        label.textContent = career;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        checkboxContainer.appendChild(div);
    });
    
    // Add event listener to filter button
    const filterBtn = document.getElementById('filter-career-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', filterByCareer);
    }
}

// Load data when page loads
window.addEventListener('DOMContentLoaded', loadAllData);