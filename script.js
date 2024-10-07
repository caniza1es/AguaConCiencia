// script.js

const consumoForm = document.getElementById('consumoForm');
const tamanoHogar = document.getElementById('tamanoHogar');
const consumoDiario = document.getElementById('consumoDiario');
const preguntasAdicionales = document.getElementById('preguntasAdicionales');
const compartirPracticas = document.getElementById('compartirPracticas');
const tieneJardin = document.getElementById('tieneJardin');
const seccionJardin = document.getElementById('seccionJardin');

const umbrales = {
    '1': 100,
    '2': 180,
    '3': 250,
    '4': 320
};

function actualizarSecciones() {
    const tamano = tamanoHogar.value;
    const consumo = parseFloat(consumoDiario.value);

    if (tamano && !isNaN(consumo)) {
        const umbralOptimo = umbrales[tamano];
        if (consumo > umbralOptimo) {
            preguntasAdicionales.style.display = 'block';
            compartirPracticas.style.display = 'none';
            setRequeridoAdicionales(true);
        } else {
            preguntasAdicionales.style.display = 'none';
            compartirPracticas.style.display = 'block';
            setRequeridoAdicionales(false);
            document.getElementById('practicasAhorro').required = true;
        }
    } else {
        preguntasAdicionales.style.display = 'none';
        compartirPracticas.style.display = 'none';
        setRequeridoAdicionales(false);
    }
}

function setRequeridoAdicionales(valor) {
    document.getElementById('fugas').required = valor;
    document.getElementById('dispositivosAhorro').required = valor;
    document.getElementById('tiempoDucha').required = valor;
    document.getElementById('electrodomesticos').required = valor;
    document.getElementById('tieneJardin').required = valor;
    document.getElementById('habitosCocina').required = valor;
    document.getElementById('recoleccionAgua').required = valor;
    document.getElementById('concienciaAgua').required = valor;
    document.getElementById('practicasAhorro').required = !valor;
    document.getElementById('razonesNoAhorro').required = valor;
}

tamanoHogar.addEventListener('change', actualizarSecciones);
consumoDiario.addEventListener('input', actualizarSecciones);

// Mostrar u ocultar preguntas sobre el jardín
tieneJardin.addEventListener('change', function() {
    if (tieneJardin.value === 'Sí') {
        seccionJardin.style.display = 'block';
        document.getElementById('riegoFrecuencia').required = true;
        document.getElementById('tipoPlantas').required = true;
    } else {
        seccionJardin.style.display = 'none';
        document.getElementById('riegoFrecuencia').required = false;
        document.getElementById('tipoPlantas').required = false;
    }
});

consumoForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const sector = document.getElementById('sector').value;
    const tamano = tamanoHogar.value;
    const consumo = parseFloat(consumoDiario.value);
    const umbralOptimo = umbrales[tamano];

    if (!sector || !tamano || isNaN(consumo)) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }

    let datosAdicionales = {};
    let practicaTexto = '';

    if (consumo > umbralOptimo) {
        const fugas = document.getElementById('fugas').value;
        const dispositivosAhorro = document.getElementById('dispositivosAhorro').value;
        const tiempoDucha = document.getElementById('tiempoDucha').value;
        const electrodomesticos = document.getElementById('electrodomesticos').value;
        const habitosCocina = document.getElementById('habitosCocina').value;
        const recoleccionAgua = document.getElementById('recoleccionAgua').value;
        const concienciaAgua = document.getElementById('concienciaAgua').value;
        const jardin = document.getElementById('tieneJardin').value;
        const razonesNoAhorro = document.getElementById('razonesNoAhorro').value.trim();

        if (!razonesNoAhorro) {
            alert('Por favor, indique las razones por las que no está tomando medidas para ahorrar agua.');
            return;
        }
        let riegoFrecuencia = '';
        let tipoPlantas = '';

        if (!fugas || !dispositivosAhorro || !tiempoDucha || !electrodomesticos || !habitosCocina || !recoleccionAgua || !concienciaAgua || !jardin) {
            alert('Por favor, complete todas las preguntas adicionales.');
            return;
        }

        if (jardin === 'Sí') {
            riegoFrecuencia = document.getElementById('riegoFrecuencia').value;
            tipoPlantas = document.getElementById('tipoPlantas').value;

            if (!riegoFrecuencia || !tipoPlantas) {
                alert('Por favor, complete las preguntas sobre su jardín.');
                return;
            }
        }

        datosAdicionales = {
            fugas: fugas,
            dispositivosAhorro: dispositivosAhorro,
            tiempoDucha: tiempoDucha,
            electrodomesticos: electrodomesticos,
            habitosCocina: habitosCocina,
            recoleccionAgua: recoleccionAgua,
            concienciaAgua: concienciaAgua,
            tieneJardin: jardin,
            riegoFrecuencia: riegoFrecuencia || null,
            tipoPlantas: tipoPlantas || null,
            razonesNoAhorro: razonesNoAhorro
        };
    } else {
        practicaTexto = document.getElementById('practicasAhorro').value.trim();
        if (!practicaTexto) {
            alert('Por favor, escribe tus prácticas de ahorro.');
            return;
        }
    }

    const datosUsuario = {
        sector: sector,
        tamanoHogar: parseInt(tamano),
        consumoDiario: consumo,
        ...datosAdicionales,
        practicaAhorro: practicaTexto || null
    };

    const nuevoUsuarioRef = database.ref('usuarios').push();
    nuevoUsuarioRef.set(datosUsuario)
    .then(() => {
        generarPDF(datosUsuario);
        consumoForm.reset();
        actualizarSecciones();
        Swal.fire({
            icon: 'success',
            title: '¡Datos guardados correctamente!',
            showConfirmButton: false,
            timer: 2000
        });
    })
    .catch(error => {
        console.error('Error al guardar los datos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al guardar los datos. Por favor, inténtelo de nuevo.'
        });
    });
});

// script.js

// ... (el resto del código permanece igual)

// Función para generar el PDF con mejoras
function generarPDF(datosUsuario) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración inicial del documento
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204); // Color azul para el título
    doc.text('Informe Personalizado de Consumo de Agua', 105, 20, null, null, 'center');

    let yPosition = 30;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Color negro para el texto

    if (datosUsuario.consumoDiario > umbrales[datosUsuario.tamanoHogar]) {
        // Mensaje introductorio empático
        doc.setFont('helvetica', 'normal');
        doc.text('Estimado usuario,', 10, yPosition);
        yPosition += 10;
        doc.text('Entendemos que el uso del agua es esencial en su día a día. Sin embargo, su consumo actual supera el promedio para un hogar de su tamaño. Nos gustaría ofrecerle algunas sugerencias que pueden ayudarle a reducir su consumo, ahorrando dinero y contribuyendo al cuidado del medio ambiente.', 10, yPosition, { maxWidth: 190 });
        yPosition += 30;

        // Sugerencias con datos y motivación
        if (datosUsuario.fugas === 'Sí' || datosUsuario.fugas === 'No estoy seguro') {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 0); // Color verde para los títulos de sugerencias
            doc.text('1. Detectar y reparar fugas', 10, yPosition);
            yPosition += 10;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text('Las fugas pueden desperdiciar hasta 15 litros de agua al día por cada grifo que gotea. Le recomendamos revisar todos los grifos y tuberías de su hogar. Si detecta alguna fuga, puede contactar a un plomero certificado. Reparar las fugas no solo ahorra agua, sino que también reduce su factura mensual.', 10, yPosition, { maxWidth: 190 });
            yPosition += 30;
        }

        if (datosUsuario.dispositivosAhorro === 'No') {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 0);
            doc.text('2. Instalar dispositivos de ahorro de agua', 10, yPosition);
            yPosition += 10;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text('Dispositivos como aireadores para grifos y cabezales de ducha de bajo flujo pueden reducir el consumo de agua hasta en un 50% sin afectar la presión del agua. Estos dispositivos son económicos y fáciles de instalar. Puede encontrarlos en ferreterías locales o tiendas especializadas en mejoras para el hogar.', 10, yPosition, { maxWidth: 190 });
            yPosition += 30;
        }

        if (datosUsuario.tiempoDucha === 'Más de 10 minutos') {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 0);
            doc.text('3. Reducir el tiempo en la ducha', 10, yPosition);
            yPosition += 10;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text('Una ducha de más de 10 minutos puede consumir hasta 200 litros de agua. Al reducir su tiempo de ducha a 5 minutos, puede ahorrar hasta 100 litros cada vez. Considere usar un temporizador o escuchar una canción para controlar el tiempo.', 10, yPosition, { maxWidth: 190 });
            yPosition += 30;
        }

        if (datosUsuario.habitosCocina !== 'No, cierro el grifo') {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 0);
            doc.text('4. Cerrar el grifo mientras lava platos o alimentos', 10, yPosition);
            yPosition += 10;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text('Dejar el grifo abierto puede desperdiciar hasta 10 litros de agua por minuto. Al cerrar el grifo mientras enjabona y abrirlo solo para enjuagar, puede ahorrar una cantidad significativa de agua diariamente.', 10, yPosition, { maxWidth: 190 });
            yPosition += 30;
        }

        if (datosUsuario.tieneJardin === 'Sí') {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 0);
            doc.text('5. Optimizar el riego del jardín', 10, yPosition);
            yPosition += 10;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text('El riego eficiente puede ahorrar hasta un 50% del agua utilizada en el jardín. Riegue sus plantas temprano en la mañana o al atardecer para reducir la evaporación. Considere plantar especies nativas que requieren menos agua.', 10, yPosition, { maxWidth: 190 });
            yPosition += 30;
        }

        // Mensaje motivacional
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(0, 0, 153);
        doc.text('Cada pequeña acción cuenta. Al implementar estas sugerencias, no solo estará ahorrando agua y dinero, sino que también estará contribuyendo a un futuro más sostenible para todos.', 10, yPosition, { maxWidth: 190 });
        yPosition += 20;
    } else {
        // Mensaje para consumo óptimo
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 128, 0); // Color verde para felicitaciones
        doc.text('¡Excelente trabajo!', 105, yPosition, null, null, 'center');
        yPosition += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Su consumo de agua es óptimo para un hogar de su tamaño. Gracias por ser parte de la solución y contribuir al cuidado de este recurso vital.', 10, yPosition, { maxWidth: 190 });
        yPosition += 20;
        if (datosUsuario.practicaAhorro) {
            doc.setFont('helvetica', 'bold');
            doc.text('Sus prácticas de ahorro:', 10, yPosition);
            yPosition += 10;
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(0, 0, 153);
            doc.text(datosUsuario.practicaAhorro, 10, yPosition, { maxWidth: 190 });
            yPosition += 30;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text('Gracias por compartir sus consejos con la comunidad. Juntos podemos marcar la diferencia.', 10, yPosition, { maxWidth: 190 });
            yPosition += 20;
        }
    }

    // Pie de página con agradecimiento
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128); // Color gris para el pie de página
    doc.text('Este informe ha sido generado para ayudarle a optimizar su consumo de agua.', 105, 290, null, null, 'center');

    // Guardar el PDF
    doc.save('informe_consumo_agua.pdf');
}

