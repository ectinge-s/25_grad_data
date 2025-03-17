// Variable to store currently filtered programs
let currentFilteredPrograms = [];
let activeTrackFilters = [];

// Function to filter programs by school
function filterBySchool() {
    // Get selected schools
    const selectedSchools = [];
    const checkboxes = document.querySelectorAll('#school-checkboxes input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => selectedSchools.push(checkbox.value));
    
    // If no schools selected, show message
    if (selectedSchools.length === 0) {
        document.getElementById('program-results').innerHTML = '<p>请选择至少一所学校</p>';
        return;
    }
    
    console.log("Selected schools:", selectedSchools);
    
    // Filter programs data
    const filteredPrograms = [];
    
    // First get matching programs from programsFoSData
    const matchingProgramsFoS = programsFoSData.filter(program => 
        selectedSchools.includes(program['目标院校'])
    );
    
    console.log("Matched programs in FoS data:", matchingProgramsFoS.length);
    
    // Find the headers that contain the FoS information
    let primaryHeader = "";
    let secondaryHeader = "";
    let matchingDescHeader = "";
    let ivyTrackHeader = "";
    
    if (programsFoSData.length > 0) {
        const headers = Object.keys(programsFoSData[0]);
        primaryHeader = headers.find(h => h.includes("主要对口科系"));
        secondaryHeader = headers.find(h => h.includes("次要可行科系"));
        matchingDescHeader = headers.find(h => h.includes("专业匹配说明"));
        ivyTrackHeader = headers.find(h => h.includes("爬藤赛道"));
    }
    
    // Use the found headers or fall back to the expected ones
    const primaryFieldName = primaryHeader || "主要对口科系（符合专业主要学术方向）";
    const secondaryFieldName = secondaryHeader || "次要可行科系（申请材料与作品集中必须向该专业主要学术方向靠拢，或体现相关技能与认知）";
    const matchingDescFieldName = matchingDescHeader || "专业匹配说明";
    const ivyTrackFieldName = ivyTrackHeader || "爬藤赛道";
    
    console.log("Using field names:", { primaryFieldName, secondaryFieldName, matchingDescFieldName, ivyTrackFieldName });
    
    // Then get corresponding program details from programsData
    matchingProgramsFoS.forEach(program => {
        const programName = program['目标院校可申请专业'];
        const school = program['目标院校'];
        
        // Get FoS and matching description information
        const primaryFoS = program[primaryFieldName] || '';
        const secondaryFoS = program[secondaryFieldName] || '';
        const matchingDescription = program[matchingDescFieldName] || '';
        const ivyTrack = program[ivyTrackFieldName] || '';
        
        // Find detailed program info
        const detailedProgram = programsData.find(p => 
            p['目标院校'] === school && p['目标院校可申请专业'] === programName
        );
        
        if (detailedProgram) {
            filteredPrograms.push({
                ...detailedProgram,
                primaryFoS: primaryFoS,
                secondaryFoS: secondaryFoS,
                matchingDescription: matchingDescription,
                ivyTrack: ivyTrack
            });
        } else {
            // If detailed info not found, use basic info
            filteredPrograms.push({
                '目标院校': school,
                '目标院校可申请专业': programName,
                primaryFoS: primaryFoS,
                secondaryFoS: secondaryFoS,
                matchingDescription: matchingDescription,
                ivyTrack: ivyTrack
            });
        }
    });
    
    console.log("Final filtered programs:", filteredPrograms.length);
    
    // Store current filtered programs for later filtering
    currentFilteredPrograms = [...filteredPrograms];
    
    // Apply track filter if active
    const finalPrograms = applyTrackFilter(filteredPrograms);
    
    // Generate and display the results table
    displayProgramResults(finalPrograms);
}

// Function to filter by ivy track
function filterByIvyTrack() {
    if (currentFilteredPrograms.length === 0) {
        // No programs to filter
        return;
    }
    
    // Apply track filter to current programs
    const filteredPrograms = applyTrackFilter(currentFilteredPrograms);
    
    // Display filtered results
    displayProgramResults(filteredPrograms);
    
    // Update the dropdown button text to show active filters
    updateTrackFilterButton();
}

// Helper function to apply track filter
function applyTrackFilter(programs) {
    // If no active track filters, return all programs
    if (activeTrackFilters.length === 0) {
        return programs;
    }
    
    // Filter programs by track
    return programs.filter(program => {
        const trackValue = program.ivyTrack || '';
        
        // For each active filter, check if the track value contains it
        return activeTrackFilters.some(filter => {
            // Split by Chinese and English commas
            const trackValues = trackValue.split(/[,，]/);
            
            // Check if any of the split values matches the filter
            return trackValues.some(value => {
                const trimmedValue = value.trim();
                return trimmedValue === filter;
            });
        });
    });
}

// Function to update track filter button text
function updateTrackFilterButton() {
    const filterButton = document.getElementById('ivy-track-btn');
    
    if (activeTrackFilters.length === 0) {
        filterButton.textContent = '选择赛道 ▼';
        filterButton.classList.remove('has-track-filters');
    } else {
        filterButton.textContent = `赛道: ${activeTrackFilters.join(', ')} ▼`;
        filterButton.classList.add('has-track-filters');
    }
}

// Function to clear track filters
// Function to clear track filters
function clearTrackFilters() {
    // Clear checkboxes
    document.querySelectorAll('#ivy-track-dropdown input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear active filters
    activeTrackFilters = [];
    
    // Update button
    updateTrackFilterButton();
    
    // Determine which page we're on and apply the appropriate refresh
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'filter-by-school.html' || currentPage === '') {
        // Re-filter to show all current filtered programs for school page
        if (currentFilteredPrograms.length > 0) {
            displayProgramResults(currentFilteredPrograms);
        }
    } else if (currentPage === 'filter-by-fos.html') {
        // Re-filter to show all current filtered programs for FoS page
        if (currentPrimaryMatches.length > 0) {
            displayFoSProgramResults(currentPrimaryMatches, 'primary-matches');
        }
        if (currentSecondaryMatches.length > 0) {
            displayFoSProgramResults(currentSecondaryMatches, 'secondary-matches');
        }
    }
}

// Function to display program results as a table
function displayProgramResults(programs) {
    const resultsContainer = document.getElementById('program-results');
    
    if (programs.length === 0) {
        resultsContainer.innerHTML = '<p>没有找到符合条件的项目</p>';
        return;
    }
    
    // If no active track filters, display normal table
    if (activeTrackFilters.length === 0) {
        displayNormalTable(programs, resultsContainer);
    } else {
        // Group programs by track type
        displayGroupedTable(programs, resultsContainer);
    }
}

// Function to display normal table without grouping
function displayNormalTable(programs, container) {
    // Create table
    let tableHTML = '<table>';
    
    // Table headers - get columns from first program but exclude specified columns
    const firstProgram = programs[0];
    const excludedColumns = ['院校背景要求', '实习实践（背景提升）要求', '实习实践（背景提升）要求-中文', 'primaryFoS', 'secondaryFoS', 'matchingDescription', 'ivyTrack', '爬藤赛道'];
    const columns = Object.keys(firstProgram).filter(key => !excludedColumns.includes(key));
    
    // Add header row
    tableHTML += '<tr>';
    columns.forEach(column => {
        // Add class for long text columns
        const columnClass = isLongTextColumn(column) ? 'class="long-text-column"' : '';
        tableHTML += `<th ${columnClass}>${column}</th>`;
    });
    tableHTML += '</tr>';
    
    // Add data rows
    programs.forEach(program => {
        tableHTML += '<tr>';
        columns.forEach(column => {
            // Special handling for program name to add hover functionality
            if (column === '目标院校可申请专业') {
                // Ensure we escape quotes in the attribute values
                const primaryFoS = (program.primaryFoS || '').replace(/"/g, '&quot;');
                const secondaryFoS = (program.secondaryFoS || '').replace(/"/g, '&quot;');
                const matchingDesc = (program.matchingDescription || '').replace(/"/g, '&quot;');
                
                tableHTML += `<td><span class="program-name" 
                    data-primary="${primaryFoS}" 
                    data-secondary="${secondaryFoS}"
                    data-matching="${matchingDesc}">${program[column]}</span></td>`;
            } 
            // Special handling for school name to make it clickable
            else if (column === '目标院校') {
                tableHTML += `<td><span class="school-name" data-school="${program[column]}">${program[column]}</span></td>`;
            }
            else if (isLongTextColumn(column)) {
                const cellContent = program[column] || '';
                resultHTML += `<td class="long-text-column">
                    <div class="expandable-cell">
                        <div class="truncate-cell">${cellContent}</div>
                        <div class="hover-trigger"></div>
                        <div class="expanded-content">${cellContent}</div>
                    </div>
                </td>`;
            }
            else {
                tableHTML += `<td>${program[column] || ''}</td>`;
            }
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</table>';
    container.innerHTML = tableHTML;
    
    // Add event listeners for program name hover
    setTimeout(() => {
        attachProgramHoverListeners();
        
        // Add event listeners for school name clicks
        attachSchoolClickListeners();
    }, 100); // Small delay to ensure DOM is updated
}

// Function to display table grouped by track type
function displayGroupedTable(programs, container) {
    // Table headers - get columns from first program but exclude specified columns
    const firstProgram = programs[0];   
    const excludedColumns = ['院校背景要求', '实习实践（背景提升）要求', '实习实践（背景提升）要求-中文', 'primaryFoS', 'secondaryFoS', 'matchingDescription', 'ivyTrack', '爬藤赛道'];
    const columns = Object.keys(firstProgram).filter(key => !excludedColumns.includes(key));
    
    let resultHTML = '';
    
    // Process each active track filter
    activeTrackFilters.forEach(track => {
        // Filter programs that match this track
        const trackPrograms = programs.filter(program => {
            const trackValue = program.ivyTrack || '';
            const trackValues = trackValue.split(/[,，]/).map(v => v.trim());
            return trackValues.includes(track);
        });
        
        if (trackPrograms.length > 0) {
            // Add section for this track
            resultHTML += `<div class="track-group">`;
            let trackFullName;
            switch(track) {
                case 'DT':
                    trackFullName = 'Design + Tech';
                    break;
                case 'AT':
                    trackFullName = 'Art + Tech';
                    break;
                case 'AH':
                    trackFullName = 'Art + Humanity';
                    break;
                case 'DH':
                    trackFullName = 'Design + Humanity';
                    break;
                case 'ADB':
                    trackFullName = 'Art/Design + Business';
                    break;
                default:
                    trackFullName = track;
            }
            resultHTML += `<h3 class="track-heading ${track}">赛道: ${trackFullName} (${trackPrograms.length}个项目)</h3>`;
            
            // Create table for this track
            resultHTML += '<table>';
            
            // Add header row
            resultHTML += '<tr>';
            columns.forEach(column => {
                const columnClass = isLongTextColumn(column) ? 'class="long-text-column"' : '';
                resultHTML += `<th>${column}</th>`;
            });
            resultHTML += '</tr>';
            
            // Add data rows
            trackPrograms.forEach(program => {
                resultHTML += '<tr>';
                columns.forEach(column => {
                    // Special handling for program name to add hover functionality
                    if (column === '目标院校可申请专业') {
                        // Ensure we escape quotes in the attribute values
                        const primaryFoS = (program.primaryFoS || '').replace(/"/g, '&quot;');
                        const secondaryFoS = (program.secondaryFoS || '').replace(/"/g, '&quot;');
                        const matchingDesc = (program.matchingDescription || '').replace(/"/g, '&quot;');
                        
                        resultHTML += `<td><span class="program-name" 
                            data-primary="${primaryFoS}" 
                            data-secondary="${secondaryFoS}"
                            data-matching="${matchingDesc}">${program[column]}</span></td>`;
                    } 
                    // Special handling for school name to make it clickable
                    else if (column === '目标院校') {
                        resultHTML += `<td><span class="school-name" data-school="${program[column]}">${program[column]}</span></td>`;
                    }
                    else if (isLongTextColumn(column)) {
                        const cellContent = program[column] || '';
                        resultHTML += `<td class="long-text-column">
                            <div class="expandable-cell">
                                <div class="truncate-cell">${cellContent}</div>
                                <div class="hover-trigger"></div>
                                <div class="expanded-content">${cellContent}</div>
                            </div>
                        </td>`;
                    }
                    else {
                        resultHTML += `<td>${program[column] || ''}</td>`;
                    }
                });
                resultHTML += '</tr>';
            });
            
            resultHTML += '</table>';
            resultHTML += `</div>`;
        }
    });
    
    // If no results found for any track
    if (resultHTML === '') {
        container.innerHTML = '<p>没有找到符合条件的项目</p>';
        return;
    }
    
    container.innerHTML = resultHTML;
    
    // Add event listeners for program name hover
    setTimeout(() => {
        attachProgramHoverListeners();
        
        // Add event listeners for school name clicks
        attachSchoolClickListeners();
    }, 100); // Small delay to ensure DOM is updated
}

// Initialize the ivy track filter dropdown
function initializeIvyTrackFilter() {
    // Toggle dropdown when button is clicked
    const dropdownBtn = document.getElementById('ivy-track-btn');
    const dropdown = document.getElementById('ivy-track-dropdown');
    
    if (dropdownBtn && dropdown) {
        dropdownBtn.addEventListener('click', function() {
            dropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        window.addEventListener('click', function(event) {
            if (!event.target.matches('.dropdown-btn') && !dropdown.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
        
        // Handle apply filter button
        const applyBtn = document.getElementById('apply-track-filter');
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                // Get selected track values
                activeTrackFilters = [];
                const checkboxes = document.querySelectorAll('#ivy-track-dropdown input[type="checkbox"]:checked');
                checkboxes.forEach(checkbox => {
                    activeTrackFilters.push(checkbox.value);
                });
                
                // Determine which page we're on and apply the appropriate filter
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage === 'filter-by-school.html' || currentPage === '') {
                    filterByIvyTrack();
                } else if (currentPage === 'filter-by-fos.html') {
                    filterFoSByTrack();
                }
                
                // Close dropdown
                dropdown.classList.remove('show');
            });
        }
        
        // Handle clear filter button
        const clearBtn = document.getElementById('clear-track-filter');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                clearTrackFilters();
                
                // Close dropdown
                dropdown.classList.remove('show');
            });
        }
    }
}

// Original functions below (unchanged)
// Function to filter programs by Field of Study
// Variables to store currently filtered FoS programs
let currentPrimaryMatches = [];
let currentSecondaryMatches = [];

// Function to filter programs by Field of Study
function filterByFoS() {
    const selectedFoS = document.getElementById('fos-dropdown').value;
    
    if (!selectedFoS) {
        // Clear results if nothing selected
        document.getElementById('subfos-careers').innerHTML = '';
        document.getElementById('primary-matches').innerHTML = '';
        document.getElementById('secondary-matches').innerHTML = '';
        return;
    }
    
    console.log("Selected FoS:", selectedFoS);
    
    // Show sub-fields and careers for the selected FoS
    displaySubfieldsAndCareers(selectedFoS);
    
    // Find the exact headers from the data
    let primaryHeader = "";
    let secondaryHeader = "";
    
    if (programsFoSData.length > 0) {
        // Find headers that contain the key phrases
        const headers = Object.keys(programsFoSData[0]);
        
        primaryHeader = headers.find(h => h.includes("主要对口科系"));
        secondaryHeader = headers.find(h => h.includes("次要可行科系"));
        
        console.log("Using primary header:", primaryHeader);
        console.log("Using secondary header:", secondaryHeader);
    }
    
    // Use the found headers or fall back to the expected ones
    const primaryFieldName = primaryHeader || "主要对口科系（符合专业主要学术方向）";
    const secondaryFieldName = secondaryHeader || "次要可行科系（申请材料与作品集中必须向该专业主要学术方向靠拢，或体现相关技能与认知）";
    
    // Helper function to check if a field contains the selected FoS
    const fieldContainsFoS = (fieldValue, fos) => {
        if (!fieldValue) return false;
        
        // Split by both Chinese and English commas
        const fosList = fieldValue.split(/[,，]/);
        
        // Check if any of the split values contains the selected FoS
        return fosList.some(item => {
            const trimmedItem = item.trim();
            return trimmedItem === fos || 
                   trimmedItem.includes(fos) || 
                   fos.includes(trimmedItem);
        });
    };
    
    // Filter programs by primary FoS
    const primaryMatches = programsFoSData.filter(program => 
        fieldContainsFoS(program[primaryFieldName], selectedFoS)
    );
    
    // Filter programs by secondary FoS, excluding those in primary
    const secondaryMatches = programsFoSData.filter(program => 
        fieldContainsFoS(program[secondaryFieldName], selectedFoS) && 
        !fieldContainsFoS(program[primaryFieldName], selectedFoS)
    );
    
    console.log("Primary matches found:", primaryMatches.length);
    console.log("Secondary matches found:", secondaryMatches.length);
    
    // Prepare program details for display
    const primaryProgramDetails = getProgramDetails(primaryMatches);
    const secondaryProgramDetails = getProgramDetails(secondaryMatches);
    
    // Store current matches for later filtering
    currentPrimaryMatches = [...primaryProgramDetails];
    currentSecondaryMatches = [...secondaryProgramDetails];
    
    // Apply track filter if active
    const filteredPrimaryMatches = applyTrackFilter(primaryProgramDetails);
    const filteredSecondaryMatches = applyTrackFilter(secondaryProgramDetails);
    
    // Display results
    displayFoSProgramResults(filteredPrimaryMatches, 'primary-matches');
    displayFoSProgramResults(filteredSecondaryMatches, 'secondary-matches');
}

// Function to filter FoS page results by track
function filterFoSByTrack() {
    if (currentPrimaryMatches.length === 0 && currentSecondaryMatches.length === 0) {
        // No programs to filter
        return;
    }
    
    // Apply track filter to current programs
    const filteredPrimaryMatches = applyTrackFilter(currentPrimaryMatches);
    const filteredSecondaryMatches = applyTrackFilter(currentSecondaryMatches);
    
    // Display filtered results
    displayFoSProgramResults(filteredPrimaryMatches, 'primary-matches');
    displayFoSProgramResults(filteredSecondaryMatches, 'secondary-matches');
    
    // Update the dropdown button text
    updateTrackFilterButton();
}

// Function to display sub-fields and careers for a FoS
function displaySubfieldsAndCareers(selectedFoS) {
    const container = document.getElementById('subfos-careers');
    
    // Find all relevant entries in fosCareerData
    const relevantFoSEntries = fosCareerData.filter(item => {
        const fos = item['科系'] || '';
        return fos === selectedFoS || fos.includes(selectedFoS) || selectedFoS.includes(fos);
    });
    
    console.log(`Found ${relevantFoSEntries.length} entries for FoS: ${selectedFoS}`);
    
    if (relevantFoSEntries.length === 0) {
        container.innerHTML = '<p>没有找到该专业领域的详细信息</p>';
        return;
    }
    
    // Filter entries to only include those with a sub-field
    const validEntries = relevantFoSEntries.filter(item => {
        return (item['可学习方向'] || '').trim() !== '';
    });
    
    console.log(`Found ${validEntries.length} valid entries with sub-fields`);
    
    // Create HTML content
    let html = '<div class="subfos-container">';
    html += `<h3>专业领域：${selectedFoS}</h3>`;
    html += '<div class="subfos-row">';
    
    // Add each sub-field as a card, only for valid entries
    validEntries.forEach(item => {
        const subField = item['可学习方向'] || '';
        const careers = item['未来发展方向'] || '';
        
        html += `<div class="subfos-card">`;
        html += `<h4>${subField}</h4>`;
        
        if (careers) {
            // Split careers by separators and format them
            const careerList = careers.split(/[;；]/);
            html += `<p><strong>未来发展方向:</strong></p>`;
            html += `<ul class="career-list">`;
            careerList.forEach(career => {
                const trimmedCareer = career.trim();
                if (trimmedCareer) {
                    // Make each career clickable
                    html += `<li><span class="career-link" data-career="${trimmedCareer}">${trimmedCareer}</span></li>`;
                }
            });
            html += `</ul>`;
        }
        
        html += `</div>`;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    
    // Add click event listeners to career links
    attachCareerClickListeners();
}

// Function to get detailed program information
function getProgramDetails(programsList) {
    const programDetails = [];
    
    // Find the headers
    let primaryHeader = "";
    let secondaryHeader = "";
    let matchingDescHeader = "";
    let ivyTrackHeader = "";
    
    if (programsFoSData.length > 0) {
        const headers = Object.keys(programsFoSData[0]);
        primaryHeader = headers.find(h => h.includes("主要对口科系"));
        secondaryHeader = headers.find(h => h.includes("次要可行科系"));
        matchingDescHeader = headers.find(h => h.includes("专业匹配说明"));
        ivyTrackHeader = headers.find(h => h.includes("爬藤赛道"));
    }
    
    // Use the found headers or fall back to the expected ones
    const primaryFieldName = primaryHeader || "主要对口科系（符合专业主要学术方向）";
    const secondaryFieldName = secondaryHeader || "次要可行科系（申请材料与作品集中必须向该专业主要学术方向靠拢，或体现相关技能与认知）";
    const matchingDescFieldName = matchingDescHeader || "专业匹配说明";
    const ivyTrackFieldName = ivyTrackHeader || "爬藤赛道";
    
    programsList.forEach(program => {
        const programName = program['目标院校可申请专业'];
        const school = program['目标院校'];
        
        // Get the primary and secondary FoS and matching description
        let primaryFoS = '';
        let secondaryFoS = '';
        let matchingDescription = '';
        let ivyTrack = '';
        
        // Get values from current program object if available
        if (program[primaryFieldName]) {
            primaryFoS = program[primaryFieldName];
        }
        
        if (program[secondaryFieldName]) {
            secondaryFoS = program[secondaryFieldName];
        }
        
        if (program[matchingDescFieldName]) {
            matchingDescription = program[matchingDescFieldName];
        }
        
        if (program[ivyTrackFieldName]) {
            ivyTrack = program[ivyTrackFieldName];
        }
        
        // Find detailed program info
        const detailedProgram = programsData.find(p => 
            p['目标院校'] === school && p['目标院校可申请专业'] === programName
        );
        
        if (detailedProgram) {
            programDetails.push({
                ...detailedProgram,
                primaryFoS: primaryFoS,
                secondaryFoS: secondaryFoS,
                matchingDescription: matchingDescription,
                ivyTrack: ivyTrack
            });
        } else {
            // If detailed info not found, use basic info
            programDetails.push({
                '目标院校': school,
                '目标院校可申请专业': programName,
                primaryFoS: primaryFoS,
                secondaryFoS: secondaryFoS,
                matchingDescription: matchingDescription,
                ivyTrack: ivyTrack
            });
        }
    });
    
    return programDetails;
}

// Function to display program results for FoS filter
function displayFoSProgramResults(programs, containerId) {
    const resultsContainer = document.getElementById(containerId);
    
    if (programs.length === 0) {
        resultsContainer.innerHTML = '<p>没有找到符合条件的项目</p>';
        return;
    }

    // If no active track filters, display normal table
    if (activeTrackFilters.length === 0) {
        displayNormalFoSTable(programs, resultsContainer);
    } else {
        // Group programs by track type
        displayGroupedFoSTable(programs, resultsContainer);
    }
}

// Function to display normal table for FoS without grouping
function displayNormalFoSTable(programs, container) {
    // Create table
    let tableHTML = '<table>';
    
    // Table headers - get columns from first program but exclude specified columns
    const firstProgram = programs[0];
    const excludedColumns = ['院校背景要求', '实习实践（背景提升）要求', '实习实践（背景提升）要求-中文', 'primaryFoS', 'secondaryFoS', 'matchingDescription', 'ivyTrack', '爬藤赛道'];
    const columns = Object.keys(firstProgram).filter(key => !excludedColumns.includes(key));
    
    // Add header row
    tableHTML += '<tr>';
    columns.forEach(column => {
        const columnClass = isLongTextColumn(column) ? 'class="long-text-column"' : '';
        tableHTML += `<th>${column}</th>`;
    });
    tableHTML += '</tr>';
    
    // Add data rows
    programs.forEach(program => {
        tableHTML += '<tr>';
        columns.forEach(column => {
            // Special handling for program name to add hover functionality
            if (column === '目标院校可申请专业') {
                // Ensure we escape quotes in the attribute values
                const primaryFoS = (program.primaryFoS || '').replace(/"/g, '&quot;');
                const secondaryFoS = (program.secondaryFoS || '').replace(/"/g, '&quot;');
                const matchingDesc = (program.matchingDescription || '').replace(/"/g, '&quot;');
                
                tableHTML += `<td><span class="program-name" 
                    data-primary="${primaryFoS}" 
                    data-secondary="${secondaryFoS}"
                    data-matching="${matchingDesc}">${program[column]}</span></td>`;
            } 
            // Special handling for school name to make it clickable
            else if (column === '目标院校') {
                tableHTML += `<td><span class="school-name" data-school="${program[column]}">${program[column]}</span></td>`;
            }
            else if (isLongTextColumn(column)) {
                const cellContent = program[column] || '';
                resultHTML += `<td class="long-text-column">
                    <div class="expandable-cell">
                        <div class="truncate-cell">${cellContent}</div>
                        <div class="hover-trigger"></div>
                        <div class="expanded-content">${cellContent}</div>
                    </div>
                </td>`;
            }
            else {
                tableHTML += `<td>${program[column] || ''}</td>`;
            }
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</table>';
    container.innerHTML = tableHTML;
    
    // Add event listeners for program name hover
    setTimeout(() => {
        attachProgramHoverListeners();
        
        // Add event listeners for school name clicks
        attachSchoolClickListeners();
    }, 100); // Small delay to ensure DOM is updated
}

// Function to display table grouped by track type for FoS
function displayGroupedFoSTable(programs, container) {
    // Table headers - get columns from first program but exclude specified columns
    const firstProgram = programs[0];
    const excludedColumns = ['院校背景要求', '实习实践（背景提升）要求', '实习实践（背景提升）要求-中文', 'primaryFoS', 'secondaryFoS', 'matchingDescription', 'ivyTrack', '爬藤赛道'];
    const columns = Object.keys(firstProgram).filter(key => !excludedColumns.includes(key));
    
    let resultHTML = '';
    
    // Process each active track filter
    activeTrackFilters.forEach(track => {
        // Filter programs that match this track
        const trackPrograms = programs.filter(program => {
            const trackValue = program.ivyTrack || '';
            const trackValues = trackValue.split(/[,，]/).map(v => v.trim());
            return trackValues.includes(track);
        });
        
        if (trackPrograms.length > 0) {
            // Get the full name of the track
            let trackFullName;
            switch(track) {
                case 'DT':
                    trackFullName = 'Design + Tech';
                    break;
                case 'AT':
                    trackFullName = 'Art + Tech';
                    break;
                case 'AH':
                    trackFullName = 'Art + Humanity';
                    break;
                case 'DH':
                    trackFullName = 'Design + Humanity';
                    break;
                case 'ADB':
                    trackFullName = 'Art/Design + Business';
                    break;
                default:
                    trackFullName = track;
            }
            
            // Add section for this track
            resultHTML += `<div class="track-group">`;
            resultHTML += `<h3 class="track-heading ${track}">赛道: ${trackFullName} (${trackPrograms.length}个项目)</h3>`;
            
            // Create table for this track
            resultHTML += '<table>';
            
            // Add header row
            resultHTML += '<tr>';
            columns.forEach(column => {
                const columnClass = isLongTextColumn(column) ? 'class="long-text-column"' : '';
                resultHTML += `<th>${column}</th>`;
            });
            resultHTML += '</tr>';
            
            // Add data rows
            trackPrograms.forEach(program => {
                resultHTML += '<tr>';
                columns.forEach(column => {
                    // Special handling for program name to add hover functionality
                    if (column === '目标院校可申请专业') {
                        // Ensure we escape quotes in the attribute values
                        const primaryFoS = (program.primaryFoS || '').replace(/"/g, '&quot;');
                        const secondaryFoS = (program.secondaryFoS || '').replace(/"/g, '&quot;');
                        const matchingDesc = (program.matchingDescription || '').replace(/"/g, '&quot;');
                        
                        resultHTML += `<td><span class="program-name" 
                            data-primary="${primaryFoS}" 
                            data-secondary="${secondaryFoS}"
                            data-matching="${matchingDesc}">${program[column]}</span></td>`;
                    } 
                    // Special handling for school name to make it clickable
                    else if (column === '目标院校') {
                        resultHTML += `<td><span class="school-name" data-school="${program[column]}">${program[column]}</span></td>`;
                    }
                    else if (isLongTextColumn(column)) {
                        const cellContent = program[column] || '';
                        resultHTML += `<td class="long-text-column">
                            <div class="expandable-cell">
                                <div class="truncate-cell">${cellContent}</div>
                                <div class="hover-trigger"></div>
                                <div class="expanded-content">${cellContent}</div>
                            </div>
                        </td>`;
                    }
                    else {
                        resultHTML += `<td>${program[column] || ''}</td>`;
                    }
                });
                resultHTML += '</tr>';
            });
            
            resultHTML += '</table>';
            resultHTML += `</div>`;
        }
    });
    
    // If no results found for any track
    if (resultHTML === '') {
        container.innerHTML = '<p>没有找到符合条件的项目</p>';
        return;
    }
    
    container.innerHTML = resultHTML;
    
    // Add event listeners for program name hover
    setTimeout(() => {
        attachProgramHoverListeners();
        
        // Add event listeners for school name clicks
        attachSchoolClickListeners();
    }, 100); // Small delay to ensure DOM is updated
}

// Function to filter by career
function filterByCareer() {
    // Get selected careers
    const selectedCareers = [];
    const checkboxes = document.querySelectorAll('#career-checkboxes input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => selectedCareers.push(checkbox.value));
    
    // If no careers selected, show message
    if (selectedCareers.length === 0) {
        document.getElementById('fos-results').innerHTML = '<p>请选择至少一个职业方向</p>';
        return;
    }
    
    console.log("Selected careers:", selectedCareers);
    
    // Organize results by career
    const careerGroups = {};
    
    selectedCareers.forEach(career => {
        careerGroups[career] = [];
    });
    
    // Filter FoS based on selected careers and group by career
    fosCareerData.forEach(item => {
        const careerDirections = item['未来发展方向'];
        if (careerDirections) {
            // Find which selected careers are mentioned in this FoS
            const matchedCareers = selectedCareers.filter(career => 
                careerDirections.includes(career)
            );
            
            if (matchedCareers.length > 0) {
                // Add this FoS to each matched career's group
                matchedCareers.forEach(career => {
                    careerGroups[career].push({
                        name: item['科系'],
                        learningDirections: item['可学习方向'],
                        careerDirections: item['未来发展方向']
                    });
                });
            }
        }
    });
    
    // Display results grouped by career
    displayCareerGroupedResults(careerGroups);
}

// Function to display FoS results for career filter
function displayCareerFilterResults(fosList) {
    const resultsContainer = document.getElementById('fos-results');
    
    if (fosList.length === 0) {
        resultsContainer.innerHTML = '<p>没有找到符合条件的专业领域</p>';
        return;
    }
    
    let html = '';
    
    fosList.forEach(fos => {
        html += `<div class="fos-card">`;
        html += `<h3 class="fos-name" data-fos="${fos.name}">${fos.name}</h3>`;
        
        // Add learning directions
        if (fos.learningDirections) {
            html += `<p><strong>可学习方向:</strong> ${fos.learningDirections}</p>`;
        }
        
        // Add career directions
        if (fos.careerDirections) {
            html += `<p><strong>未来发展方向:</strong> ${fos.careerDirections}</p>`;
        }
        
        html += `</div>`;
    });
    
    resultsContainer.innerHTML = html;
    
    // Add event listeners for FoS name clicks
    attachFoSClickListeners();
}

// Updated attachProgramHoverListeners function
function attachProgramHoverListeners() {
    const programNames = document.querySelectorAll('.program-name');
    
    console.log(`Found ${programNames.length} program names to attach hover listeners to`);
    
    programNames.forEach(program => {
        // Remove any existing listeners first
        program.removeEventListener('mouseenter', handleProgramMouseEnter);
        program.removeEventListener('mouseleave', handleProgramMouseLeave);
        
        // Add new listeners
        program.addEventListener('mouseenter', handleProgramMouseEnter);
        program.addEventListener('mouseleave', handleProgramMouseLeave);
    });
}

// Function to show FoS overlay on program hover
function showFoSOverlay(event) {
    // Set flag to indicate the program name is being hovered
    window.programNameHovered = true;
    
    const programElement = event.target;
    const primaryFoS = programElement.getAttribute('data-primary');
    const secondaryFoS = programElement.getAttribute('data-secondary');
    const matchingDescription = programElement.getAttribute('data-matching');
    
    // Remove any existing overlay
    hideFoSOverlay();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'fos-overlay';
    overlay.id = 'fos-overlay';
    
    let overlayHTML = '';
    
    // Process primary FoS
    if (primaryFoS) {
        overlayHTML += `<p><strong>主要对口科系:</strong> `;
        
        // Split by both Chinese and English commas
        const primaryFosList = primaryFoS.split(/[,，]/);
        
        primaryFosList.forEach((fos, index) => {
            const trimmedFoS = fos.trim();
            if (trimmedFoS) {
                // Add comma before item (except first)
                if (index > 0) overlayHTML += ', ';
                
                overlayHTML += `<span class="fos-link" data-fos="${trimmedFoS}">${trimmedFoS}</span>`;
            }
        });
        
        overlayHTML += `</p>`;
    }
    
    // Process secondary FoS
    if (secondaryFoS) {
        overlayHTML += `<p><strong>次要可行科系:</strong> `;
        
        // Split by both Chinese and English commas
        const secondaryFosList = secondaryFoS.split(/[,，]/);
        
        secondaryFosList.forEach((fos, index) => {
            const trimmedFoS = fos.trim();
            if (trimmedFoS) {
                // Add comma before item (except first)
                if (index > 0) overlayHTML += ', ';
                
                overlayHTML += `<span class="fos-link" data-fos="${trimmedFoS}">${trimmedFoS}</span>`;
            }
        });
        
        overlayHTML += `</p>`;
    }
    
    // Add matching description
    if (matchingDescription) {
        overlayHTML += `<p><strong>专业匹配说明:</strong> ${matchingDescription}</p>`;
    }
    
    // If all fields are empty, show a message
    if (!primaryFoS && !secondaryFoS && !matchingDescription) {
        overlayHTML = '<p>没有相关专业领域信息</p>';
    }
    
    overlay.innerHTML = overlayHTML;
    
    // Position the overlay
    const rect = programElement.getBoundingClientRect();
    overlay.style.top = `${rect.bottom + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    
    // Add overlay to document
    document.body.appendChild(overlay);
    
    // Set initial overlay hovered state
    window.overlayHovered = false;
    
    // Add mouse enter/leave handlers to the overlay
    overlay.addEventListener('mouseenter', () => {
        window.overlayHovered = true;
    });
    
    overlay.addEventListener('mouseleave', () => {
        window.overlayHovered = false;
        // Check if we should hide the overlay
        if (!window.programNameHovered) {
            hideFoSOverlay();
        }
    });
    
    // Add click event listeners to FoS links
    const fosLinks = overlay.querySelectorAll('.fos-link');
    fosLinks.forEach(link => {
        link.addEventListener('click', function() {
            const fos = this.getAttribute('data-fos');
            window.location.href = `filter-by-fos.html?fos=${encodeURIComponent(fos)}`;
        });
    });
}

// Function to hide FoS overlay
function hideFoSOverlay() {
    const overlay = document.getElementById('fos-overlay');
    if (overlay) {
        overlay.remove();
    }
    window.overlayHovered = false;
}

// Function to attach click event listeners to school names
function attachSchoolClickListeners() {
    const schoolNames = document.querySelectorAll('.school-name');
    
    schoolNames.forEach(school => {
        school.addEventListener('click', function() {
            const schoolName = this.getAttribute('data-school');
            window.location.href = `filter-by-school.html?school=${encodeURIComponent(schoolName)}`;
        });
    });
}

// Function to attach click event listeners to FoS names
function attachFoSClickListeners() {
    const fosNames = document.querySelectorAll('.fos-name');
    
    fosNames.forEach(fos => {
        fos.addEventListener('click', function() {
            const fosName = this.getAttribute('data-fos');
            window.location.href = `filter-by-fos.html?fos=${encodeURIComponent(fosName)}`;
        });
    });
}

function handleProgramMouseEnter(event) {
    showFoSOverlay(event);
}

// Function to handle mouse leave from program name
function handleProgramMouseLeave(event) {
    // Set a flag to indicate the mouse has left the program name
    // We'll check this flag after a delay to see if we should hide the overlay
    window.programNameHovered = false;
    
    setTimeout(() => {
        // Only hide if mouse is not over the program name or the overlay
        if (!window.programNameHovered && !window.overlayHovered) {
            hideFoSOverlay();
        }
    }, 100);
}

function displayCareerGroupedResults(careerGroups) {
    const resultsContainer = document.getElementById('fos-results');
    
    let html = '';
    
    // Check if we have any results
    const hasResults = Object.values(careerGroups).some(group => group.length > 0);
    
    if (!hasResults) {
        resultsContainer.innerHTML = '<p>没有找到符合条件的专业领域</p>';
        return;
    }
    
    // Create a section for each career
    for (const career in careerGroups) {
        const fosItems = careerGroups[career];
        
        if (fosItems.length > 0) {
            html += `<div class="career-group">`;
            html += `<h3>职业方向: ${career}</h3>`;
            
            fosItems.forEach(fos => {
                html += `<div class="fos-card">`;
                html += `<h4 class="fos-name" data-fos="${fos.name}">${fos.name}</h4>`;
                
                // Add learning directions
                if (fos.learningDirections) {
                    html += `<p><strong>可学习方向:</strong> ${fos.learningDirections}</p>`;
                }
                
                // Add career directions
                if (fos.careerDirections) {
                    html += `<p><strong>未来发展方向:</strong> ${fos.careerDirections}</p>`;
                }
                
                html += `</div>`;
            });
            
            html += `</div>`;
        }
    }
    
    resultsContainer.innerHTML = html;
    
    // Add event listeners for FoS name clicks
    attachFoSClickListeners();
}

function attachCareerClickListeners() {
    const careerLinks = document.querySelectorAll('.career-link');
    
    careerLinks.forEach(link => {
        link.addEventListener('click', function() {
            const career = this.getAttribute('data-career');
            window.location.href = `filter-by-career.html?career=${encodeURIComponent(career)}`;
        });
    });
}

function isLongTextColumn(columnName) {
    return columnName === '专业背景要求' || 
           columnName === 'GPA要求 四分制或百分制' || 
           columnName === '语言要求' || 
           columnName === '作品集要求' ||
           columnName.includes('背景要求') ||
           columnName.includes('GPA') ||
           columnName.includes('语言') ||
           columnName.includes('作品集');
}