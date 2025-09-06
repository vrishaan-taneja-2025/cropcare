 let diseases = [];


  
  // DOM elements
        const diseaseCards = document.querySelector('.disease-cards');
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        const tags = document.querySelectorAll('.tag');
        const diseaseDetail = document.querySelector('.disease-detail');
        const backBtn = document.querySelector('.back-btn');
        
        // Detail elements
        const detailTitle = document.getElementById('detail-title');
        const detailCrops = document.getElementById('detail-crops');
        const detailSymptoms = document.getElementById('detail-symptoms');
        const detailPrevention = document.getElementById('detail-prevention');
        const detailTreatment = document.getElementById('detail-treatment');
        const detailInfo = document.getElementById('detail-info');

        // Generate disease cards
        function generateDiseaseCards(diseasesArray) {
            diseaseCards.innerHTML = '';
            
            diseasesArray.forEach(disease => {
                const severityClass = disease.severity === 'high' ? 'high' : 
                                    disease.severity === 'medium' ? 'medium' : 'low';
                
                const severityText = disease.severity === 'high' ? 'High Severity' : 
                                    disease.severity === 'medium' ? 'Medium Severity' : 'Low Severity';
                
                const card = document.createElement('div');
                card.className = 'disease-card';
                card.innerHTML = `
                    <div class="card-header">
                        <h3>${disease.name}</h3>
                        <span class="severity ${severityClass}">${severityText}</span>
                    </div>
                    <div class="card-body">
                        <p><strong>Affected Crops:</strong> ${disease.crops}</p>
                        <p class="symptoms">${disease.symptoms.substring(0, 100)}...</p>
                        <div class="solutions">
                            <div class="solution-item">
                                <i class="fas fa-shield-alt"></i>
                                <span>${disease.prevention.substring(0, 80)}...</span>
                            </div>
                        </div>
                    </div>
                `;
                
                card.addEventListener('click', () => showDiseaseDetail(disease));
                diseaseCards.appendChild(card);
            });
        }

        // Show disease detail
        function showDiseaseDetail(disease) {
            detailTitle.textContent = disease.name;
            detailCrops.textContent = disease.crops;
            detailSymptoms.textContent = disease.symptoms;
            detailPrevention.textContent = disease.prevention;
            detailTreatment.textContent = disease.treatment;
            detailInfo.textContent = disease.info;
            
            document.querySelector('.results-section').scrollIntoView();
            diseaseDetail.style.display = 'block';
        }

        // Search functionality
        function searchDiseases() {
            const searchTerm = searchInput.value.toLowerCase();
            
            if (searchTerm === '') {
                generateDiseaseCards(diseases);
                return;
            }
            
            const filteredDiseases = diseases.filter(disease => 
                disease.name.toLowerCase().includes(searchTerm) ||
                disease.crops.toLowerCase().includes(searchTerm) ||
                disease.symptoms.toLowerCase().includes(searchTerm)
            );
            
            generateDiseaseCards(filteredDiseases);
        }

        // Event listeners
        searchBtn.addEventListener('click', searchDiseases);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') searchDiseases();
        });

        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                searchInput.value = tag.textContent;
                searchDiseases();
            });
        });

        backBtn.addEventListener('click', () => {
            diseaseDetail.style.display = 'none';
        });

        // Initialize the page
        fetch('/api/diseases')
        .then(response => response.json())
        .then(data => {
        diseases = data; // assign global variable
        generateDiseaseCards(diseases);
        })
        .catch(err => console.error("Error fetching diseases:", err));
