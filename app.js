let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

let fotoTemporal = "";

let semanaSeleccionada = "Semana actual";

document.addEventListener("DOMContentLoaded", function () {

  const fotoInput = document.getElementById("fotoInput");

  fotoInput.addEventListener("change", function (event) {

    const archivo = event.target.files[0];

    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = function (e) {

      fotoTemporal = e.target.result;

      document.getElementById("previewFoto").src = fotoTemporal;

      document.getElementById("previewBox").style.display = "block";

    };

    reader.readAsDataURL(archivo);

  });

  mostrarTickets();

});

function guardarTicket() {

  if (fotoTemporal === "") {

    alert("Haz una foto primero");

    return;

  }

  const tipo = document.getElementById("tipo").value;

  const ahora = new Date();

  const ticket = {

    tipo: tipo,

    fecha: ahora.toLocaleDateString(),

    hora: ahora.toLocaleTimeString(),

    imagen: fotoTemporal,

    semana: semanaSeleccionada

  };

  tickets.push(ticket);

  localStorage.setItem("tickets", JSON.stringify(tickets));

  fotoTemporal = "";

  document.getElementById("previewFoto").src = "";

  document.getElementById("previewBox").style.display = "none";

  document.getElementById("fotoInput").value = "";

  alert("✅ Ticket guardado correctamente");

  mostrarTickets();

  document.getElementById("zonaTickets").scrollIntoView({
    behavior: "smooth"
  });

}

function mostrarTickets() {

  const contenedor = document.getElementById("tickets");

  contenedor.innerHTML = "";

  if (tickets.length === 0) {

    contenedor.innerHTML =
      "<p>No hay tickets guardados.</p>";

    return;

  }

  tickets.forEach(function (ticket, index) {

    contenedor.innerHTML += `

      <div class="ticket">

        <h3>${ticket.tipo}</h3>

        <p>${ticket.fecha} - ${ticket.hora}</p>

        <img src="${ticket.imagen}">

        <button onclick="eliminarTicket(${index})">
          Eliminar ticket
        </button>

      </div>

    `;

  });

}

function eliminarTicket(index) {

  const confirmar = confirm(
    "¿Eliminar este ticket?"
  );

  if (!confirmar) return;

  tickets.splice(index, 1);

  localStorage.setItem("tickets", JSON.stringify(tickets));

  mostrarTickets();

}

function eliminarFotoTemporal() {

  fotoTemporal = "";

  document.getElementById("previewFoto").src = "";

  document.getElementById("previewBox").style.display = "none";

  document.getElementById("fotoInput").value = "";

}

function generarPDF() {

  alert("PDF próximamente");

}

function cambiarModo() {

  document.body.classList.toggle("modo-dia");

}
