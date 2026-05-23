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
    const ticket = {
      tipo: tipo,
      fecha: new Date().toLocaleString(),
      imagen: e.target.result
    };

    tickets.push(ticket);
    localStorage.setItem("tickets", JSON.stringify(tickets));

    mostrarTickets();
    fotoInput.value = "";

    alert("Ticket guardado");
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
        <p>${ticket.fecha}</p>
        <img src="${ticket.imagen}">
      </div>
    `;
  });
}

async function generarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const tipos = ["Desayuno", "Almuerzo", "Cena"];
  let primeraPagina = true;

  tipos.forEach(tipo => {
    const ticketsTipo = tickets.filter(ticket => ticket.tipo === tipo);

    if (ticketsTipo.length === 0) return;

    if (!primeraPagina) {
      pdf.addPage();
    }

    primeraPagina = false;

    let y = 15;
    let contador = 0;

    pdf.setFontSize(18);
    pdf.text(tipo, 10, y);
    y += 10;

    ticketsTipo.forEach(ticket => {
      if (contador === 6) {
        pdf.addPage();
        y = 15;
        contador = 0;
        pdf.setFontSize(18);
        pdf.text(tipo, 10, y);
        y += 10;
      }

      pdf.setFontSize(10);
      pdf.text(ticket.fecha, 10, y);
      y += 5;

      pdf.addImage(ticket.imagen, "JPEG", 10, y, 55, 35);

      y += 43;
      contador++;
    });
  });

  pdf.save("tickets-semana.pdf");
    }
