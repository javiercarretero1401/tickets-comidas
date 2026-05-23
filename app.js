let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

mostrarTickets();

function guardarTicket() {
  const tipo = document.getElementById("tipo").value;
  const fotoInput = document.getElementById("fotoInput");

  if (!fotoInput.files[0]) {
    alert("Haz una foto del ticket");
    return;
  }

  const archivo = fotoInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const ahora = new Date();

    const ticket = {
      tipo: tipo,
      fecha: ahora.toLocaleDateString(),
      hora: ahora.toLocaleTimeString(),
      fechaISO: ahora.toISOString(),
      imagen: e.target.result
    };

    tickets.push(ticket);
    localStorage.setItem("tickets", JSON.stringify(tickets));

    mostrarTickets();
    fotoInput.value = "";

    alert("✅ Ticket guardado correctamente");
  };

  reader.readAsDataURL(archivo);
}

function mostrarTickets() {
  const contenedor = document.getElementById("tickets");
  contenedor.innerHTML = "";

  [...tickets].reverse().forEach(ticket => {
    contenedor.innerHTML += `
      <div class="ticket">
        <h3>${ticket.tipo}</h3>
        <p>${ticket.fecha} - ${ticket.hora || ""}</p>
        <img src="${ticket.imagen}">
      </div>
    `;
  });
}

function pedirSemana() {
  const semana = prompt(
    "Escribe la semana del informe en formato AAAA-MM-DD.\n\nEjemplo: 2026-05-18\n\nPon el lunes de la semana que quieres."
  );

  if (!semana) return null;

  const fechaInicio = new Date(semana + "T00:00:00");
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaInicio.getDate() + 7);

  return { fechaInicio, fechaFin };
}

async function generarPDF() {
  const rango = pedirSemana();

  if (!rango) return;

  const { fechaInicio, fechaFin } = rango;
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const ticketsSemana = tickets.filter(ticket => {
    const fechaTicket = new Date(ticket.fechaISO);
    return fechaTicket >= fechaInicio && fechaTicket < fechaFin;
  });

  if (ticketsSemana.length === 0) {
    alert("No hay tickets guardados en esa semana");
    return;
  }

  const tipos = ["Desayuno", "Al
