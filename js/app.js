// Main application script

// Function to handle URL parameters
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = window.location.pathname.split('/').pop();
    
    // Handle school parameter for filter-by-school.html
    if (currentPage === 'filter-by-school.html') {
        const school = urlParams.get('school');
        if (school) {
            // Wait for data to load and UI to initialize
            setTimeout(() => {
                // Check the corresponding checkbox
                const checkbox = document.querySelector(`#school-checkboxes input[value="${school}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    // Trigger filter
                    document.getElementById('filter-school-btn').click();
                }
            }, 500);
        }
        
        // Handle track parameter for ivy track filter
        const track = urlParams.get('track');
        if (track) {
            // Wait for data to load and UI to initialize
            setTimeout(() => {
                // Check the corresponding checkbox in the dropdown
                const trackCheckbox = document.querySelector(`#ivy-track-dropdown input[value="${track}"]`);
                if (trackCheckbox) {
                    trackCheckbox.checked = true;
                    // Set active track filters
                    if (typeof activeTrackFilters !== 'undefined') {
                        activeTrackFilters = [track];
                        // Update button text
                        updateTrackFilterButton();
                    }
                }
            }, 600);
        }
    }
    
    // Handle fos parameter for filter-by-fos.html
    if (currentPage === 'filter-by-fos.html') {
        const fos = urlParams.get('fos');
        if (fos) {
            // Wait for data to load and UI to initialize
            setTimeout(() => {
                // Select the corresponding option
                const dropdown = document.getElementById('fos-dropdown');
                for (let i = 0; i < dropdown.options.length; i++) {
                    if (dropdown.options[i].value === fos) {
                        dropdown.selectedIndex = i;
                        // Trigger change event
                        const event = new Event('change');
                        dropdown.dispatchEvent(event);
                        break;
                    }
                }
            }, 500);
        }
    }
    
    // Handle career parameter for filter-by-career.html
    if (currentPage === 'filter-by-career.html') {
        const career = urlParams.get('career');
        if (career) {
            // Wait for data to load and UI to initialize
            setTimeout(() => {
                // Find and check the corresponding checkbox
                const checkbox = document.querySelector(`#career-checkboxes input[value="${career}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    // Trigger filter
                    document.getElementById('filter-career-btn').click();
                } else {
                    console.warn(`Checkbox for career "${career}" not found`);
                }
            }, 500);
        }
    }
}

// Function to get unique careers from the FoS-Career data
function getUniqueCareers() {
    const careerSet = new Set();
    
    fosCareerData.forEach(item => {
        const careerDirections = item['未来发展方向'];
        if (careerDirections) {
            // Split by common separators
            const careerList = careerDirections.split(/[,，、;；\/\|]/);
            careerList.forEach(career => {
                const trimmedCareer = career.trim();
                if (trimmedCareer) {
                    careerSet.add(trimmedCareer);
                }
            });
        }
    });
    
    return [...careerSet].sort();
}

// Function to get unique fields of study
function getUniqueFoS() {
    const fosSet = new Set();
    
    fosCareerData.forEach(item => {
        const fos = item['科系'];
        if (fos) {
            fosSet.add(fos);
        }
    });
    
    return [...fosSet].sort();
}

// Function to get unique ivy track values
function getUniqueIvyTracks() {
    const trackSet = new Set();
    
    // Look for the ivy track header
    let ivyTrackHeader = "";
    if (programsFoSData.length > 0) {
        const headers = Object.keys(programsFoSData[0]);
        ivyTrackHeader = headers.find(h => h.includes("爬藤赛道"));
    }
    
    // Use the found header or fall back to the expected one
    const ivyTrackFieldName = ivyTrackHeader || "爬藤赛道";
    
    // Extract all unique track values
    programsFoSData.forEach(program => {
        const trackValue = program[ivyTrackFieldName];
        if (trackValue && trackValue.trim() !== '') {
            trackSet.add(trackValue.trim());
        }
    });
    
    return [...trackSet].sort();
}

// Function to initialize additional UI elements for the current page
// Function to initialize additional UI elements for the current page
function initializeAdditionalUIElements() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Initialize Ivy Track filter on both pages
    if (currentPage === 'filter-by-school.html' || currentPage === '' || 
        currentPage === 'filter-by-fos.html') {
        if (typeof initializeIvyTrackFilter === 'function') {
            initializeIvyTrackFilter();
        }
    }
}

// Event listener for when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Handle URL parameters after a short delay to ensure data is loaded
    setTimeout(handleURLParameters, 1000);
    
    // Initialize additional UI elements
    setTimeout(initializeAdditionalUIElements, 800);
});

// Helper function for debugging
function logDataSummary() {
    console.log('Programs Data Summary:');
    console.log(`Total programs: ${programsData.length}`);
    if (programsData.length > 0) {
        console.log('Sample program:', programsData[0]);
        console.log('Headers:', Object.keys(programsData[0]));
    }
    
    console.log('Programs-FoS Data Summary:');
    console.log(`Total mappings: ${programsFoSData.length}`);
    if (programsFoSData.length > 0) {
        console.log('Sample mapping:', programsFoSData[0]);
        console.log('Headers:', Object.keys(programsFoSData[0]));
    }
    
    console.log('FoS-Career Data Summary:');
    console.log(`Total FoS: ${fosCareerData.length}`);
    if (fosCareerData.length > 0) {
        console.log('Sample FoS:', fosCareerData[0]);
        console.log('Headers:', Object.keys(fosCareerData[0]));
    }
    
    // Log unique values
    console.log('Unique schools:', [...new Set(programsData.map(p => p['目标院校']))].filter(Boolean));
    console.log('Unique careers:', getUniqueCareers());
    console.log('Unique Fields of Study:', getUniqueFoS());
    console.log('Unique Ivy Tracks:', getUniqueIvyTracks());
}