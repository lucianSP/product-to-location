// script.js

let locations = [];
let products = [];
let assignments = [];

const locationFileInput = document.getElementById("locationFile");
const productFileInput = document.getElementById("productFile");
const tableContainer = document.getElementById("tableContainer");
const exportBtn = document.getElementById("exportBtn");

window.addEventListener("beforeunload", (e) => {
  if (assignments.length > 0) {
    e.preventDefault();
    e.returnValue = "You have unsaved assignments. Please export before closing.";
  }
});

locationFileInput.addEventListener("change", (e) => handleCSVUpload(e, "location"));
productFileInput.addEventListener("change", (e) => handleCSVUpload(e, "product"));

function handleCSVUpload(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const lines = text.trim().split("\n").slice(1);

    if (type === "location") {
      locations = lines.map(line => line.trim());
    } else {
      products = lines.map(line => {
        const [code, name] = line.split(",").map(e => e.trim());
        return { code, name };
      });
    }

    if (locations.length && products.length) renderTable();
  };
  reader.readAsText(file);
}

function renderTable() {
  assignments = [];
  tableContainer.innerHTML = "";

  const table = document.createElement("table");
  const header = document.createElement("tr");
  header.innerHTML = "<th>Location Code</th><th>Type</th><th>Select Product</th>";
  table.appendChild(header);

  locations.forEach(location => {
    addTableRow(table, location);
  });

  tableContainer.appendChild(table);
}

function addTableRow(table, location) {
  const row = document.createElement("tr");
  const type = /[A-Za-z]$/.test(location) ? "Picking" : "Storage";

  const locationCell = document.createElement("td");
  locationCell.textContent = location;

  const typeCell = document.createElement("td");
  typeCell.textContent = type;

  const selectCell = document.createElement("td");
  const select = document.createElement("select");
  select.innerHTML = `<option value="">-- Select Product --</option>` +
    products.map(p => `<option value="${p.code}">${p.code} - ${p.name}</option>`).join("");
  select.addEventListener("change", () => {
    const selected = products.find(p => p.code === select.value);
    if (selected) {
      assignments.push({ location, ...selected });
    }
  });
  selectCell.appendChild(select);

  row.appendChild(locationCell);
  row.appendChild(typeCell);
  row.appendChild(selectCell);

  table.appendChild(row);
}

exportBtn.addEventListener("click", () => {
  if (assignments.length === 0) {
    alert("No assignments to export.");
    return;
  }

  const rows = ["Location_Code,Product_Code,Product_Name"];
  assignments.forEach(a => {
    rows.push(`${a.location},${a.code},${a.name}`);
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "assignments.csv";
  link.click();
});

