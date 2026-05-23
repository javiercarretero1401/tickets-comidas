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

  tickets.reverse().forEach(ticket => {

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

  let y = 10;

  pdf.setFontSize(18);
  pdf.text("Informe semanal de tickets", 10, y);

  y += 10;

  tickets.forEach((ticket, index) => {

    if (y > 240) {
      pdf.addPage();
      y = 10;
    }

    pdf.setFontSize(12);

    pdf.text(ticket.tipo, 10, y);

    y += 6;

    pdf.text(ticket.fecha, 10, y);

    y += 6;

    pdf.addImage(ticket.imagen, "JPEG", 10, y, 60, 60);

    y += 70;

  });

  pdf.save("tickets-semana.pdf");

}
