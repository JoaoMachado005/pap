const steps = [
    "processador",
    "placa-mae",
    "memoria",
    "armazenamento",
    "placa-video",
    "fonte",
    "gabinete"
  ];
  
  let selectedComponents = {};
  let allComponents = {}; // carregado do "banco de dados" (ou simulado)
  
  const componentContainer = document.querySelector(".component-cards");
  const totalPriceEl = document.getElementById("totalPrice");
  const previewContainer = document.querySelector(".preview-components");
  const compatibilityAlert = document.querySelector(".compatibility-alert");
  
  document.addEventListener("DOMContentLoaded", () => {
    loadComponentData(); // Simula o carregamento
    setupStepper();
    setupFilters();
    document.getElementById("resetBuilder").addEventListener("click", resetBuilder);
    document.getElementById("finishBuild").addEventListener("click", finishBuild);
  });
  
  // Simulação de dados
  function loadComponentData() {
    allComponents = {
      processador: [
        { id: 1, nome: "Intel i5", preco: 1200, soquete: "LGA1200", marca: "Intel" },
        { id: 2, nome: "AMD Ryzen 5", preco: 1100, soquete: "AM4", marca: "AMD" }
      ],
      "placa-mae": [
        { id: 10, nome: "Placa ASUS AM4", preco: 700, soquete: "AM4", marca: "ASUS" },
        { id: 11, nome: "Placa Gigabyte LGA1200", preco: 800, soquete: "LGA1200", marca: "Gigabyte" }
      ],
      memoria: [
        { id: 20, nome: "8GB DDR4", preco: 250, tipo: "DDR4", marca: "Kingston" }
      ],
      armazenamento: [
        { id: 30, nome: "SSD 512GB", preco: 350, tipo: "SSD", marca: "WD" }
      ],
      "placa-video": [
        { id: 40, nome: "RTX 3060", preco: 2000, marca: "NVIDIA" }
      ],
      fonte: [
        { id: 50, nome: "Fonte 600W", preco: 400, potencia: 600, marca: "Corsair" }
      ],
      gabinete: [
        { id: 60, nome: "Gabinete Mid Tower", preco: 300, marca: "Cooler Master" }
      ]
    };
  
    renderComponentCards("processador");
  }
  
  function setupStepper() {
    document.querySelectorAll("#stepper .nav-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector("#stepper .nav-link.active").classList.remove("active");
        link.classList.add("active");
  
        const step = link.dataset.step;
        renderComponentCards(step);
      });
    });
  }
  
  function renderComponentCards(step) {
    componentContainer.innerHTML = "";
    if (!allComponents[step]) return;
  
    const brandFilter = document.getElementById("brandFilter").value;
    const priceFilter = document.getElementById("priceFilter").value;
  
    let filtered = allComponents[step];
  
    // Filtro de compatibilidade
    if (step === "placa-mae" && selectedComponents["processador"]) {
      const soqueteProcessador = selectedComponents["processador"].soquete;
      filtered = filtered.filter(item => item.soquete === soqueteProcessador);
    }
  
    if (step === "processador" && selectedComponents["placa-mae"]) {
      const soquetePlacaMae = selectedComponents["placa-mae"].soquete;
      filtered = filtered.filter(item => item.soquete === soquetePlacaMae);
    }
  
    // Filtros manuais (marca e preço)
    if (brandFilter) {
      filtered = filtered.filter(item => item.marca === brandFilter);
    }
  
    if (priceFilter) {
      filtered = filtered.filter(item => {
        const preco = item.preco;
        if (priceFilter === "0-1000") return preco <= 1000;
        if (priceFilter === "1000-2000") return preco > 1000 && preco <= 2000;
        if (priceFilter === "2000+") return preco > 2000;
        return true;
      });
    }
  
    // Exibe os cards
    if (filtered.length === 0) {
      componentContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning">Nenhum componente compatível encontrado.</div>
        </div>
      `;
      return;
    }
  
    filtered.forEach(component => {
      const card = document.createElement("div");
      card.className = "col-md-6";
      card.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-title">${component.nome}</h6>
            <p class="card-text">Marca: ${component.marca || "N/A"}</p>
            <p class="card-text">Preço: R$ ${component.preco.toFixed(2)}</p>
            <button class="btn btn-primary btn-sm select-btn" data-step="${step}" data-id="${component.id}">Selecionar</button>
          </div>
        </div>
      `;
      componentContainer.appendChild(card);
  
      card.querySelector(".select-btn").addEventListener("click", () => {
        selectComponent(step, component);
      });
    });
  }
  
  function selectComponent(step, component) {
    selectedComponents[step] = component;
    updatePreview();
    checkCompatibility();
    updateTotal();
  }
  
  function updatePreview() {
    previewContainer.querySelectorAll(".preview-component").forEach(preview => {
      const key = preview.dataset.component;
      const selected = selectedComponents[key];
      preview.querySelector(".component-name").textContent = selected ? selected.nome : "Nenhum selecionado";
      preview.querySelector(".component-price").textContent = selected ? `R$ ${selected.preco.toFixed(2)}` : "R$ 0,00";
    });
  }
  
  function updateTotal() {
    const total = Object.values(selectedComponents).reduce((acc, comp) => acc + (comp?.preco || 0), 0);
    totalPriceEl.textContent = `R$ ${total.toFixed(2)}`;
  }
  
  function checkCompatibility() {
    const proc = selectedComponents["processador"];
    const mobo = selectedComponents["placa-mae"];
    let compatible = true;
  
    if (proc && mobo) {
      compatible = proc.soquete === mobo.soquete;
    }
  
    compatibilityAlert.classList.toggle("bg-success-subtle", compatible);
    compatibilityAlert.classList.toggle("bg-danger-subtle", !compatible);
    compatibilityAlert.querySelector("p").textContent = compatible
      ? "Todos os componentes selecionados são compatíveis."
      : "Atenção: alguns componentes podem ser incompatíveis!";
  }
  
  function setupFilters() {
    document.getElementById("brandFilter").addEventListener("change", () => {
      const activeStep = document.querySelector("#stepper .nav-link.active").dataset.step;
      renderComponentCards(activeStep);
    });
    document.getElementById("priceFilter").addEventListener("change", () => {
      const activeStep = document.querySelector("#stepper .nav-link.active").dataset.step;
      renderComponentCards(activeStep);
    });
  }
  
  function resetBuilder() {
    selectedComponents = {};
    updatePreview();
    updateTotal();
    checkCompatibility();
    Swal.fire("Reiniciado!", "Sua montagem foi reiniciada.", "info");
  }
  
  function finishBuild() {
    const total = Object.values(selectedComponents).reduce((acc, comp) => acc + (comp?.preco || 0), 0);
    Swal.fire({
      icon: "success",
      title: "Montagem Finalizada",
      html: `Total: <strong>R$ ${total.toFixed(2)}</strong><br>Você pode agora prosseguir com a compra.`,
      confirmButtonText: "Fechar"
    });
  }
  function selectComponent(step, component) {
    selectedComponents[step] = component;
    updatePreview();
    checkCompatibility();
    updateTotal();
    goToNextStep(step);
  }
  
  function goToNextStep(currentStep) {
    const index = steps.indexOf(currentStep);
    if (index >= 0 && index < steps.length - 1) {
      const nextStep = steps[index + 1];
      const nextLink = document.querySelector(`#stepper .nav-link[data-step="${nextStep}"]`);
      if (nextLink) {
        nextLink.click(); // Ativa a próxima aba
      }
    }
  }
  
  