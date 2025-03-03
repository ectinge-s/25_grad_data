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
    
    if (programsFoSData.length > 0) {
        const headers = Object.keys(programsFoSData[0]);
        primaryHeader = headers.find(h => h.includes("主要对口科系"));
        secondaryHeader = headers.find(h => h.includes("次要可行科系"));
        matchingDescHeader = headers.find(h => h.includes("专业匹配说明"));
    }
    
    // Use the found headers or fall back to the expected ones
    const primaryFieldName = primaryHeader || "主要对口科系（符合专业主要学术方向）";
    const secondaryFieldName = secondaryHeader || "次要可行科系（申请材料与作品集中必须向该专业主要学术方向靠拢，或体现相关技能与认知）";
    const matchingDescFieldName = matchingDescHeader || "专业匹配说明";
    
    console.log("Using field names:", { primaryFieldName, secondaryFieldName, matchingDescFieldName });
    
    // Then get corresponding program details from programsData
    matchingProgramsFoS.forEach(program => {
        const programName = program['目标院校可申请专业'];
        const school = program['目标院校'];
        
        // Get FoS and matching description information
        const primaryFoS = program[primaryFieldName] || '';
        const secondaryFoS = program[secondaryFieldName] || '';
        const matchingDescription = program[matchingDescFieldName] || '';
        
        // Find detailed program info
        const detailedProgram = programsData.find(p => 
            p['目标院校'] === school && p['目标院校可申请专业'] === programName
        );
        
        if (detailedProgram) {
            filteredPrograms.push({
                ...detailedProgram,
                primaryFoS: primaryFoS,
                secondaryFoS: secondaryFoS,
                matchingDescription: matchingDescription
            });
        } else {
            // If detailed info not found, use basic info
            filteredPrograms.push({
                '目标院校': school,
                '目标院校可申请专业': programName,
                primaryFoS: primaryFoS,
                secondaryFoS: secondaryFoS,
                matchingDescription: matchingDescription
            });
        }
    });
    
    console.log("Final filtered programs:", filteredPrograms.length);
    
    // Generate and display the results table
    displayProgramResults(filteredPrograms);
}

// Function to display program results as a table
function displayProgramResults(programs) {
    const resultsContainer = document.getElementById('program-results');
    
    if (programs.length === 0) {
        resultsContainer.innerHTML = '<p>没有找到符合条件的项目</p>';
        return;
    }
    
    // Create table
    let tableHTML = '<table>';
    
    // Table headers - get columns from first program but exclude specified columns
    const firstProgram = programs[0];
    const excludedColumns = ['院校背景要求', '实习实践（背景提升）要求', '实习实践（背景提升）要求-中文', 'primaryFoS', 'secondaryFoS', 'matchingDescription'];
    const columns = Object.keys(firstProgram).filter(key => !excludedColumns.includes(key));
    
    // Add header row
    tableHTML += '<tr>';
    columns.forEach(column => {
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
            else {
                tableHTML += `<td>${program[column] || ''}</td>`;
            }
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</table>';
    resultsContainer.innerHTML = tableHTML;
    
    // Add event listeners for program name hover
    setTimeout(() => {
        attachProgramHoverListeners();
        
        // Add event listeners for school name clicks
        attachSchoolClickListeners();
    }, 100); // Small delay to ensure DOM is updated
}

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
    
    // Display results
    displayFoSProgramResults(primaryProgramDetails, 'primary-matches');
    displayFoSProgramResults(secondaryProgramDetails, 'secondary-matches');
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
// Updated getProgramDetails function
function getProgramDetails(programsList) {
    const programDetails = [];
    
    // Find the headers
    let primaryHeader = "";
    let secondaryHeader = "";
    let matchingDescHeader = "";
    
    if (programsFoSData.length > 0) {
        const headers = Object.keys(programsFoSData[0]);
        primaryHeader = headers.find(h => h.includes("主要对口科系"));
        secondaryHeader = headers.find(h => h.includes("次要可行科系"));
        matchingDescHeader = headers.find(h => h.includes("专业匹配说明"));
    }
    
    // Use the found headers or fall back to the expected ones
    const primaryFieldName = primaryHeader || "主要对口科系（符合专业主要学术方向）";
    const secondaryFieldName = secondaryHeader || "次要可行科系（申请材料与作品集中必须向该专业主要学术方向靠拢，或体现相关技能与认知）";
    const matchingDescFieldName = matchingDescHeader || "专业匹配说明";
    
    programsList.forEach(program => {
        const programName = program['目标院校可申请专业'];
        const school = program['目标院校'];
        
        // Get the primary and secondary FoS and matching description
        let primaryFoS = '';
        let secondaryFoS = '';
        let matchingDescription = '';
        
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
        
        // Find detailed program info
        const detailedProgram = programsData.find(p => 
            p['目标院校'] === school && p['目标院校可申请专业'] === programName
        );
        
        if (detailedProgram) {
            programDetails.push({
                ...detailedProgram,
                primaryFoS: primaryFoS,
                secondaryFoS: secondaryFoS,
                matchingDescription: matchingDescription
            });
        } else {
            // If detailed info not found, use basic info
            programDetails.push({
                '目标院校': school,
                '目标院校可申请专业': programName,
                primaryFoS: primaryFoS,
                secondaryFoS: secondaryFoS,
                matchingDescription: matchingDescription
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
    
    // Create table
    let tableHTML = '<table>';
    
    // Table headers - get columns from first program but exclude specified columns
    const firstProgram = programs[0];
    const excludedColumns = ['院校背景要求', '实习实践（背景提升）要求', '实习实践（背景提升）要求-中文', 'primaryFoS', 'secondaryFoS', 'matchingDescription'];
    const columns = Object.keys(firstProgram).filter(key => !excludedColumns.includes(key));
    
    // Add header row
    tableHTML += '<tr>';
    columns.forEach(column => {
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
            else {
                tableHTML += `<td>${program[column] || ''}</td>`;
            }
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</table>';
    resultsContainer.innerHTML = tableHTML;
    
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