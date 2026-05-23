let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
let fotoTemporal = "";
let semanaSeleccionada = obtenerSemanaActual();

iniciarApp();

function iniciarApp() {
  prepararCamara();
  crearSemanaActual();
}

function prepararCamara() {
  document.getElementById("fotoInput").addEventListener("change", function() {
    const archivo = this.files[0];
    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = function(e) {
      fotoTemporal = e.target.result;
      document.getElementById("previewFoto").src = fotoTemporal;
      document.getElementById("previewBox").style.display = "block";
    };

    reader.readAsDataURL(archivo);
  });
}

function obtenerSemanaActual() {
  return obtenerSemanaDeFecha(new Date());
}

function obtenerSemanaDeFecha(fecha) {
  const fechaCopia = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dia = fechaCopia.getUTCDay() || 7;
  fechaCopia.setUTCDate(fechaCopia.getUTCDate() + 4 - dia);
  const inicioAno = new Date(Date.UTC(fechaCopia.getUTCFullYear(), 0, 1));
  const numeroSemana = Math.ceil((((fechaCopia - inicioAno) / 86400000) + 1) / 7);
  const ano = fechaCopia.getUTCFullYear();

  return ano + "-S" + String(numeroSemana).padStart(2, "0");
}

function crearSemanaActual() {
  semanaSeleccionada = obtenerSemanaActual();
  actualizarSelectorSemanas();
  mostrarTickets();
}

function actualizarSelectorSemanas() {
  const selector = document.getElementById("selectorSemana");
  const semanas = [...new Set(tickets.map(ticket => ticket.semana))];

  if (!semanas.includes(semanaSeleccionada)) {
    semanas.push(semanaSeleccionada);
  }

  semanas.sort().reverse();
  selector.innerHTML = "";

  semanas.forEach(semana => {
    const option = document.createElement("option");
    option.value = semana;
    option.textContent = "Semana " + semana;
    selector.appendChild(option);
  });

  selector.value = semanaSeleccionada;

  document.getElementById("tituloSemana").textContent =
    "Semana seleccionada: " + semanaSeleccionada;
}

function cambiarSemana() {
  semanaSeleccionada = document.getElementById("selectorSemana").value;
  mostrarTickets();
}

function eliminarFotoTemporal() {
  fotoTemporal = "";
  document.getElementById("fotoInput").value = "";
  document.getElementById("previewFoto").src = "";
  document.getElementById("previewBox").style.display = "none";
  mostrarMensaje("Foto eliminada. Puedes hacer otra.", "orange");
}

function guardarTicket() {
  const tipo = document.getElementById("tipo").value;

  if (!fotoTemporal) {
    mostrarMensaje("Primero haz una foto del ticket.", "red");
    return;
  }

  const ahora = new Date();

  const ticket = {
    tipo: tipo,
    fecha: ahora.toLocaleDateString(),
    hora: ahora.toLocaleTimeString(),
    fechaISO: ahora.toISOString(),
    semana: semanaSeleccionada,
    imagen: fotoTemporal
  };

  tickets.push(ticket);
  localStorage.setItem("tickets", JSON.stringify(tickets));

  fotoTemporal = "";
  document.getElementById("fotoInput").value = "";
  document.getElementById("previewFoto").src = "";
  document.getElementById("previewBox").style.display = "none";

  actualizarSelectorSemanas();
  mostrarTickets();

  mostrarMensaje("✅ Ticket guardado correctamente", "green");

  setTimeout(() => {
    document.getElementById("zonaTickets").scrollIntoView({
      behavior: "smooth"
    });
  }, 500);
}

function mostrarMensaje(texto, color) {
  let aviso = document.getElementById("avisoGrande");

  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "avisoGrande";
    document.body.prepend(aviso);
  }

  aviso.textContent = texto;
  aviso.style.background = color;
  aviso.style.color = "white";
  aviso.style.padding = "15px";
  aviso.style.marginBottom = "15px";
  aviso.style.borderRadius = "10px";
  aviso.style.textAlign = "center";
  aviso.style.fontSize = "20px";
  aviso.style.fontWeight = "bold";

  setTimeout(() => {
    aviso.remove();
  }, 4000);
}

function mostrarTickets() {
  actualizarSelectorSemanas();

  const contenedor = document.getElementById("tickets");
  contenedor.innerHTML = "";

  const ticketsSemana = tickets.filter(ticket => ticket.semana === semanaSeleccionada);

  if (ticketsSemana.length === 0) {
    contenedor.innerHTML = "<p>No hay tickets guardados en esta semana.</p>";
    return;
  }

  const tipos = ["Desayuno", "Almuerzo", "Cena"];

  tipos.forEach(tipo => {
    const ticketsTipo = ticketsSemana.filter(ticket => ticket.tipo === tipo);

    if (ticketsTipo.length === 0) return;

    contenedor.innerHTML += `<h3 class="bloqueTipo">${tipo}</h3>`;

    ticketsTipo.forEach(ticket => {
      const indexReal = tickets.indexOf(ticket);

      contenedor.innerHTML += `
        <div class="ticket">
          <h3>${ticket.tipo}</h3>
          <p>${ticket.fecha} - ${ticket.hora}</p>
          <img src="${ticket.imagen}">
          <button onclick="eliminarTicket(${indexReal})">Eliminar ticket</button>
        </div>
      `;
    });
  });
}

function eliminarTicket(index) {
  const confirmar = confirm("¿Seguro que quieres eliminar este ticket?");
  if (!confirmar) return;

  tickets.splice(index, 1);
  localStorage.setItem("tickets", JSON.stringify(tickets));

  actualizarSelectorSemanas();
  mostrarTickets();
  mostrarMensaje("Ticket eliminado", "orange");
}

async function generarPDF() {
  const ticketsSemana = tickets.filter(ticket => ticket.semana === semanaSeleccionada);

  if (ticketsSemana.length === 0) {
    mostrarMensaje("No hay tickets en esta semana.", "red");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const tipos = ["Desayuno", "Almuerzo", "Cena"];
  let primeraPagina = true;

  tipos.forEach(tipo => {
    const ticketsTipo = ticketsSemana.filter(ticket => ticket.tipo === tipo);

    if (ticketsTipo.length === 0) return;

    if (!primeraPagina) pdf.addPage();
    primeraPagina = false;

    let y = 15;
    let contador = 0;

    pdf.setFontSize(18);
    pdf.text(tipo + " - " + semanaSeleccionada, 10, y);
    y += 10;

    ticketsTipo.forEach(ticket => {
      if (contador === 6) {
        pdf.addPage();
        y = 15;
        contador = 0;
        pdf.setFontSize(18);
        pdf.text(tipo + " - " + semanaSeleccionada, 10, y);
        y += 10;
      }

      pdf.setFontSize(10);
      pdf.text(ticket.fecha + " - " + ticket.hora, 10, y);
      y += 5;

      pdf.addImage(ticket.imagen, "JPEG", 10, y, 55, 35);

      y += 43;
      contador++;
    });
  });

  pdf.save("tickets-" + semanaSeleccionada + ".pdf");
}

function cambiarModo() {
  document.body.classList.toggle("modo-dia");

  if (document.body.classList.contains("modo-dia")) {
    localStorage.setItem("modo", "dia");
  } else {
    localStorage.setItem("modo", "noche");
  }
}

if (localStorage.getItem("modo") === "dia") {
  document.body.classList.add("modo-dia");
}
