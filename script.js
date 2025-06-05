document.addEventListener('DOMContentLoaded', () => {
    const areaJugadores = document.getElementById('areaJugadores');
    const contador = document.getElementById('contador');
    const botonLimpiar = document.getElementById('botonLimpiar');
    const botonSortear = document.getElementById('botonSortear');
    const listaBlanco = document.getElementById('lista-blanco');
    const listaNegro = document.getElementById('lista-negro');
    const listaVisual = document.getElementById('lista-jugadores');

    // Actualiza el contador de jugadores
    const actualizarContador = () => {
        const jugadores = areaJugadores.value.split('\n').filter(Boolean);
        contador.textContent = jugadores.length;
    };

    // Renderiza la lista visual con iconos y selección de arqueros (máx 2)
    function renderListaJugadores() {
        listaVisual.innerHTML = '';
        let jugadores = areaJugadores.value.split('\n').filter(j => j.trim() !== '');

        jugadores.forEach((jugador, idx) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '10px';
            li.style.fontSize = '1.1em';

            // Icono
            const icono = document.createElement('span');
            icono.className = 'icono-jugador';

            // Detecta si este jugador es arquero por la clase (se guarda en dataset)
            let esArquero = li.dataset.arquero === 'true' || false;
            // Si ya hay una selección previa en el DOM, la respeta
            if (jugador.endsWith('🧤')) {
                esArquero = true;
                jugador = jugador.replace('🧤', '').trim();
            }

            // Si ya se había seleccionado antes, respeta la selección
            if (window._arquerosSeleccionados && window._arquerosSeleccionados[idx]) {
                esArquero = true;
            }

            icono.textContent = esArquero ? '🧤' : '⚽';
            if (esArquero) li.classList.add('es-arquero');

            icono.style.cursor = 'pointer';
            icono.onclick = () => {
                // Solo permite máximo 2 arqueros
                const arquerosActuales = listaVisual.querySelectorAll('.es-arquero').length;
                if (!li.classList.contains('es-arquero') && arquerosActuales >= 2) {
                    mostrarModalAlerta('Solo puedes seleccionar 2 arqueros.');
                    return;
                }
                li.classList.toggle('es-arquero');
                icono.textContent = li.classList.contains('es-arquero') ? '🧤' : '⚽';

                // Guarda la selección temporalmente para mantenerla al actualizar
                window._arquerosSeleccionados = Array.from(listaVisual.children).map(li => li.classList.contains('es-arquero'));
                actualizarParticipanteVisual();
            };

            // Nombre limpio (sin "goalie" ni emoji)
            const nombre = document.createElement('span');
            nombre.textContent = jugador.replace(/goalie/ig, '').replace('🧤', '').trim();

            li.appendChild(icono);
            li.appendChild(nombre);
            listaVisual.appendChild(li);
        });
    }

    // Actualiza el textarea según la selección visual de arqueros (sin "goalie" en el texto)
    function actualizarParticipanteVisual() {
        const nuevos = [];
        listaVisual.querySelectorAll('li').forEach(li => {
            let nombre = li.querySelector('span:last-child').textContent;
            // No agregues "goalie" al nombre, solo guarda el nombre limpio
            nuevos.push(nombre);
        });
        areaJugadores.value = nuevos.join('\n');
        actualizarContador();
        // Mantiene la selección de arqueros al actualizar
        renderListaJugadores();
    }

    // Eventos para actualizar la lista visual y el contador
    areaJugadores.addEventListener('input', () => {
        window._arquerosSeleccionados = undefined; // Resetea selección si se edita a mano
        actualizarContador();
        renderListaJugadores();
    });

    areaJugadores.addEventListener('keyup', (e) => {
        window._arquerosSeleccionados = undefined;
        actualizarContador();
        renderListaJugadores();
    });

    // Inicializa la lista visual al cargar
    renderListaJugadores();

    botonLimpiar.addEventListener('click', () => {
    areaJugadores.value = '';
    listaBlanco.innerHTML = '';
    listaNegro.innerHTML = '';
    listaVisual.innerHTML = '';
    window._arquerosSeleccionados = undefined;
    actualizarContador();
    areaJugadores.focus(); // Hace que el cursor vuelva al textarea
    });

    botonSortear.addEventListener('click', () => {
        // Toma los jugadores y detecta arqueros según la lista visual
        const jugadores = [];
        listaVisual.querySelectorAll('li').forEach(li => {
            let nombre = li.querySelector('span:last-child').textContent;
            let esArquero = li.classList.contains('es-arquero');
            jugadores.push({ nombre, arquero: esArquero });
        });

        if (jugadores.length < 10) {
            mostrarModalAlerta('Se necesitan al menos 10 jugadores para sortear dos equipos de 5.');
            return;
        }

        // Mezclar aleatoriamente el array de jugadores
        for (let i = jugadores.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [jugadores[i], jugadores[j]] = [jugadores[j], jugadores[i]];
        }

        const arqueros = jugadores.filter(j => j.arquero);
        const jugadoresDeCampo = jugadores.filter(j => !j.arquero);

        let equipoBlanco = [];
        let equipoNegro = [];

        // Asignar arqueros
        if (arqueros.length > 0) {
            equipoBlanco.push(arqueros.shift().nombre);
        }
        if (arqueros.length > 0) {
            equipoNegro.push(arqueros.shift().nombre);
        }

        // Juntar el resto de arqueros (si hay más de 2) con los jugadores de campo
        const restoJugadores = jugadoresDeCampo.map(j => j.nombre).concat(arqueros.map(j => j.nombre));

        // Repartir jugadores de campo
        let turnoBlanco = true;
        while (restoJugadores.length > 0) {
            if (turnoBlanco && equipoBlanco.length < 5) {
                equipoBlanco.push(restoJugadores.shift());
            } else if (!turnoBlanco && equipoNegro.length < 5) {
                equipoNegro.push(restoJugadores.shift());
            }
            else if (equipoBlanco.length >= 5) {
                equipoNegro.push(restoJugadores.shift());
            } else if (equipoNegro.length >= 5) {
                equipoBlanco.push(restoJugadores.shift());
            }
            turnoBlanco = !turnoBlanco;
        }

        // Mostrar resultados
        mostrarEquipo(listaBlanco, equipoBlanco);
        mostrarEquipo(listaNegro, equipoNegro);

        // Scroll automático solo en mobile
        if (window.innerWidth <= 800) {
            const cancha = document.querySelector('.campo-juego');
            if (cancha) {
                cancha.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    // Muestra los equipos sorteados, arquero con camiseta amarilla
    botonSortear.addEventListener('click', () => {
    // ...código existente...
    // Guarda los arqueros sorteados para mostrar el fondo amarillo
    window._arquerosSorteados = [];
    if (equipoBlanco.length > 0) window._arquerosSorteados.push(equipoBlanco[0]);
    if (equipoNegro.length > 0) window._arquerosSorteados.push(equipoNegro[0]);
    // Mostrar resultados
    mostrarEquipo(listaBlanco, equipoBlanco);
    mostrarEquipo(listaNegro, equipoNegro);
    // ...código existente...
});
});

// Estado de focus para los campos editables
document.querySelectorAll('.info-partido .editar').forEach(function(el) {
    function toggleBorder() {
        if (el.textContent.trim().length > 0) {
            el.classList.add('sin-borde');
        } else {
            el.classList.remove('sin-borde');
        }
    }
    el.addEventListener('input', toggleBorder);
    el.addEventListener('blur', toggleBorder);
    // Inicializa al cargar
    toggleBorder();
});


function mostrarEquipo(listaElement, equipo) {
    listaElement.innerHTML = '';
    equipo.forEach((jugador, idx) => {
        const li = document.createElement('li');
        // Si es el primer jugador del equipo, es el arquero
        if (idx === 0) {
            li.classList.add('goalkeeper');
            li.textContent = jugador + '';
        } else {
            li.textContent = jugador;
        }
        listaElement.appendChild(li);
    });
}



function mostrarModalAlerta(mensaje) {
    const modal = document.getElementById('modal-alerta');
    const mensajeDiv = document.getElementById('modal-alerta-mensaje');
    mensajeDiv.textContent = mensaje;
    modal.classList.remove('modal-alerta-oculto');
    modal.style.display = 'flex';
}
function cerrarModalAlerta() {
    const modal = document.getElementById('modal-alerta');
    modal.classList.add('modal-alerta-oculto');
    modal.style.display = 'none';
}