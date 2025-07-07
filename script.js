document.addEventListener('DOMContentLoaded', () => {
    const areaJugadores = document.getElementById('areaJugadores');
    const contador = document.getElementById('contador');
    const botonLimpiar = document.getElementById('botonLimpiar');
    const botonSortear = document.getElementById('botonSortear');
    const listaBlanco = document.getElementById('lista-blanco');
    const listaNegro = document.getElementById('lista-negro');
    const listaVisual = document.getElementById('lista-jugadores');
    
    // Elementos del historial
    const botonGuardar = document.getElementById('botonGuardar');
    const botonVerHistorial = document.getElementById('botonVerHistorial');
    const botonLimpiarHistorial = document.getElementById('botonLimpiarHistorial');
    const listaHistorial = document.getElementById('lista-historial');
    const modalHistorial = document.getElementById('modal-historial');
    
    // Elementos de resultado
    const seccionResultado = document.getElementById('seccion-resultado');
    const btnGanoBlanco = document.getElementById('btnGanoBlanco');
    const btnEmpate = document.getElementById('btnEmpate');
    const btnGanoNegro = document.getElementById('btnGanoNegro');
    const resultadoSeleccionado = document.getElementById('resultado-seleccionado');
    const textoResultado = document.getElementById('texto-resultado');
    const btnCambiarResultado = document.getElementById('btnCambiarResultado');
    
    // Variable para almacenar el último sorteo y resultado
    let ultimoSorteo = null;
    let resultadoPartido = null;

    // Actualiza el contador de jugadores
    const actualizarContador = () => {
        const jugadores = areaJugadores.value.split('\n').filter(Boolean);
        const cantidad = jugadores.length;
        
        if (cantidad === 10) {
            contador.textContent = `${cantidad}/10 ✅`;
            contador.style.backgroundColor = 'rgba(16, 185, 129, 0.8)';
            contador.style.color = '#ffffff';
        } else if (cantidad > 10) {
            contador.textContent = `${cantidad}/10 ⚠️`;
            contador.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
            contador.style.color = '#ffffff';
        } else {
            contador.textContent = `${cantidad}/10`;
            contador.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            contador.style.color = '#e2e8f0';
        }
    };

    // Renderiza la lista visual con iconos y selección de arqueros (máx 2)
    function renderListaJugadores() {
        listaVisual.innerHTML = '';
        let jugadores = areaJugadores.value.split('\n').filter(j => j.trim() !== '');
        
        // Limitar a 10 jugadores máximo
        if (jugadores.length > 10) {
            jugadores = jugadores.slice(0, 10);
        }

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
        
        // Limitar a 10 jugadores
        if (nuevos.length > 10) {
            const jugadoresLimitados = nuevos.slice(0, 10);
            areaJugadores.value = jugadoresLimitados.join('\n');
            mostrarModalAlerta('Solo se permiten 10 jugadores máximo.');
        } else {
            areaJugadores.value = nuevos.join('\n');
        }
        
        actualizarContador();
        // Mantiene la selección de arqueros al actualizar
        renderListaJugadores();
    }

    // Eventos para actualizar la lista visual y el contador
    areaJugadores.addEventListener('input', () => {
        const jugadores = areaJugadores.value.split('\n').filter(j => j.trim() !== '');
        
        // Limitar a 10 jugadores
        if (jugadores.length > 10) {
            // Tomar solo los primeros 10 jugadores
            const jugadoresLimitados = jugadores.slice(0, 10);
            areaJugadores.value = jugadoresLimitados.join('\n');
            mostrarModalAlerta('Solo se permiten 10 jugadores máximo.');
        }
        
        window._arquerosSeleccionados = undefined; // Resetea selección si se edita a mano
        actualizarContador();
        renderListaJugadores();
    });

    areaJugadores.addEventListener('keyup', (e) => {
        const jugadores = areaJugadores.value.split('\n').filter(j => j.trim() !== '');
        
        // Limitar a 10 jugadores
        if (jugadores.length > 10) {
            // Tomar solo los primeros 10 jugadores
            const jugadoresLimitados = jugadores.slice(0, 10);
            areaJugadores.value = jugadoresLimitados.join('\n');
            mostrarModalAlerta('Solo se permiten 10 jugadores máximo.');
        }
        
        window._arquerosSeleccionados = undefined;
        actualizarContador();
        renderListaJugadores();
    });

    // Evento para paste (pegar texto)
    areaJugadores.addEventListener('paste', (e) => {
        setTimeout(() => {
            const jugadores = areaJugadores.value.split('\n').filter(j => j.trim() !== '');
            
            // Limitar a 10 jugadores
            if (jugadores.length > 10) {
                const jugadoresLimitados = jugadores.slice(0, 10);
                areaJugadores.value = jugadoresLimitados.join('\n');
                mostrarModalAlerta('Solo se permiten 10 jugadores máximo.');
            }
            
            window._arquerosSeleccionados = undefined;
            actualizarContador();
            renderListaJugadores();
        }, 10);
    });

    // Inicializar modal historial como oculto
    modalHistorial.classList.add('modal-historial-oculto');
    modalHistorial.style.display = 'none';
    modalHistorial.style.visibility = 'hidden';
    modalHistorial.style.opacity = '0';
    
    // Inicializa la lista visual al cargar
    renderListaJugadores();
    
    // Event listeners para el historial
    botonGuardar.addEventListener('click', guardarEnHistorial);
    botonVerHistorial.addEventListener('click', abrirModalHistorial);
    botonLimpiarHistorial.addEventListener('click', limpiarHistorial);
    
    // Event listeners para resultados
    btnGanoBlanco.addEventListener('click', () => seleccionarResultado('gano-blanco'));
    btnEmpate.addEventListener('click', () => seleccionarResultado('empate'));
    btnGanoNegro.addEventListener('click', () => seleccionarResultado('gano-negro'));
    btnCambiarResultado.addEventListener('click', mostrarOpcionesResultado);

    botonLimpiar.addEventListener('click', () => {
        areaJugadores.value = '';
        listaBlanco.innerHTML = '';
        listaNegro.innerHTML = '';
        listaVisual.innerHTML = '';
        window._arquerosSeleccionados = undefined;
        actualizarContador();
        areaJugadores.focus(); // Hace que el cursor vuelva al textarea
        
        // Deshabilitar botón guardar al limpiar
        ultimoSorteo = null;
        resultadoPartido = null;
        botonGuardar.disabled = true;
    });

    botonSortear.addEventListener('click', () => {
        // Toma los jugadores y detecta arqueros según la lista visual
        const jugadores = [];
        listaVisual.querySelectorAll('li').forEach(li => {
            let nombre = li.querySelector('span:last-child').textContent;
            let esArquero = li.classList.contains('es-arquero');
            jugadores.push({ nombre, arquero: esArquero });
        });

        if (jugadores.length !== 10) {
            mostrarModalAlerta('Se necesitan exactamente 10 jugadores para sortear dos equipos de 5.');
            return;
        }

        // Mostrar loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.add('show');
        
        // Deshabilitar el botón temporalmente
        botonSortear.disabled = true;

        // Ejecutar el sorteo después de 1.5 segundos para crear suspenso
        setTimeout(() => {
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
            
            // Guardar el último sorteo para poder agregarlo al historial
            ultimoSorteo = {
                equipoBlanco: [...equipoBlanco],
                equipoNegro: [...equipoNegro],
                fecha: new Date()
            };
            
            // No mostrar sección de resultado aquí, se manejará desde el historial
            resultadoPartido = null;
            
            // Habilitar el botón de guardar
            botonGuardar.disabled = false;

            // Ocultar loading overlay
            loadingOverlay.classList.remove('show');
            
            // Rehabilitar el botón de sortear
            botonSortear.disabled = false;

            // Scroll automático solo en mobile
            if (window.innerWidth <= 800) {
                const cancha = document.querySelector('.campo-juego');
                if (cancha) {
                    cancha.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }, 1000); // 1.5 segundos de loading para crear más suspenso
    });

    // Funciones del historial
    function abrirModalHistorial() {
        cargarHistorial();
        modalHistorial.classList.remove('modal-historial-oculto');
        modalHistorial.style.display = 'flex';
        modalHistorial.style.visibility = 'visible';
        modalHistorial.style.opacity = '1';
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }

    // Funciones de resultado
    function seleccionarResultado(tipo) {
        resultadoPartido = tipo;
        
        let textoRes = '';
        switch(tipo) {
            case 'gano-blanco':
                textoRes = '🏆 Ganó Equipo Blanco';
                break;
            case 'empate':
                textoRes = '🤝 Empate';
                break;
            case 'gano-negro':
                textoRes = '🏆 Ganó Equipo Negro';
                break;
        }
        
        textoResultado.textContent = textoRes;
        
        // Ocultar opciones y mostrar resultado seleccionado
        document.querySelector('.opciones-resultado').style.display = 'none';
        resultadoSeleccionado.style.display = 'block';
    }

    function mostrarOpcionesResultado() {
        document.querySelector('.opciones-resultado').style.display = 'flex';
        resultadoSeleccionado.style.display = 'none';
        resultadoPartido = null;
    }

    function guardarEnHistorial() {
        if (!ultimoSorteo) return;
        
        let historial = JSON.parse(localStorage.getItem('historialEquipos') || '[]');
        
        // Agregar el nuevo sorteo al historial con resultado
        historial.unshift({
            id: Date.now(),
            equipoBlanco: ultimoSorteo.equipoBlanco,
            equipoNegro: ultimoSorteo.equipoNegro,
            fecha: ultimoSorteo.fecha.toISOString(),
            resultado: resultadoPartido // Puede ser null si no se seleccionó resultado
        });
        
        // Limitar el historial a 20 elementos
        if (historial.length > 20) {
            historial = historial.slice(0, 20);
        }
        
        localStorage.setItem('historialEquipos', JSON.stringify(historial));
        cargarHistorial();
        
        // Deshabilitar botón hasta el próximo sorteo
        botonGuardar.disabled = true;
        ultimoSorteo = null;
        resultadoPartido = null;
        
        mostrarModalAlerta('¡Equipos guardados en el historial!');
    }

    function cargarHistorial() {
        const historial = JSON.parse(localStorage.getItem('historialEquipos') || '[]');
        
        if (historial.length === 0) {
            listaHistorial.innerHTML = '<p class="historial-vacio">No hay equipos guardados en el historial</p>';
            return;
        }
        
        let html = '';
        historial.forEach(item => {
            const fecha = new Date(item.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Determinar el resultado
            let resultadoTexto = 'Sin resultado';
            let resultadoClase = 'resultado-sin';
            let iconoResultado = '⚪';
            
            if (item.resultado) {
                switch(item.resultado) {
                    case 'gano-blanco':
                        resultadoTexto = 'Ganó Blanco';
                        resultadoClase = 'resultado-blanco';
                        iconoResultado = '⚪🏆';
                        break;
                    case 'empate':
                        resultadoTexto = 'Empate';
                        resultadoClase = 'resultado-empate';
                        iconoResultado = '🤝';
                        break;
                    case 'gano-negro':
                        resultadoTexto = 'Ganó Negro';
                        resultadoClase = 'resultado-negro';
                        iconoResultado = '⚫🏆';
                        break;
                }
            }
            
            html += `
                <div class="item-historial-compacto">
                    <div class="historial-fila" onclick="toggleHistorialItem(${item.id})">
                        <div class="historial-info">
                            <span class="historial-fecha-compacta">${fechaFormateada}</span>
                            <span class="historial-resultado-compacto ${resultadoClase}">
                                ${iconoResultado} ${resultadoTexto}
                            </span>
                        </div>
                        <div class="historial-controles">
                            <button class="btn-eliminar-item" onclick="event.stopPropagation(); eliminarDelHistorial(${item.id})" title="Eliminar partido">🗑️</button>
                            <div class="historial-toggle" id="toggle-${item.id}">
                                <span class="toggle-text">Ver equipos</span>
                                <span class="toggle-icon">👁️</span>
                            </div>
                        </div>
                    </div>
                    <div class="historial-detalles" id="detalles-${item.id}" style="display: none;">
                        <div class="historial-equipos">
                            <div class="historial-equipo blanco">
                                <h4>⚪ Equipo Blanco</h4>
                                <ul>
                                    ${item.equipoBlanco.map((jugador, idx) => 
                                        `<li class="${idx === 0 ? 'goalkeeper' : ''}">${jugador}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                            <div class="historial-equipo negro">
                                <h4>⚫ Equipo Negro</h4>
                                <ul>
                                    ${item.equipoNegro.map((jugador, idx) => 
                                        `<li class="${idx === 0 ? 'goalkeeper' : ''}">${jugador}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Sección de resultado integrada en el historial -->
                        <div class="resultado-historial-section">
                            <h4>🏆 Resultado del Partido</h4>
                            <div class="resultado-estado" id="resultado-estado-${item.id}">
                                ${item.resultado ? `
                                    <div class="resultado-actual ${item.resultado === 'gano-blanco' ? 'resultado-blanco' : item.resultado === 'gano-negro' ? 'resultado-negro' : 'resultado-empate'}">
                                        ${item.resultado === 'gano-blanco' ? '🏆 Ganó Equipo Blanco' : 
                                          item.resultado === 'gano-negro' ? '🏆 Ganó Equipo Negro' : 
                                          '🤝 Empate'}
                                    </div>
                                    <button class="btn-cambiar-resultado" onclick="mostrarOpcionesResultadoHistorial(${item.id})">Cambiar resultado</button>
                                ` : `
                                    <div class="sin-resultado">
                                        <p>⚪ Sin resultado registrado</p>
                                        <button class="btn-agregar-resultado" onclick="mostrarOpcionesResultadoHistorial(${item.id})">Agregar resultado</button>
                                    </div>
                                `}
                            </div>
                            <div class="opciones-resultado-historial" id="opciones-resultado-${item.id}" style="display: none;">
                                <div class="botones-resultado-historial">
                                    <button class="btn-resultado-historial blanco" onclick="seleccionarResultadoHistorial(${item.id}, 'gano-blanco')">
                                        🏆 Ganó Equipo Blanco
                                    </button>
                                    <button class="btn-resultado-historial empate" onclick="seleccionarResultadoHistorial(${item.id}, 'empate')">
                                        🤝 Empate
                                    </button>
                                    <button class="btn-resultado-historial negro" onclick="seleccionarResultadoHistorial(${item.id}, 'gano-negro')">
                                        🏆 Ganó Equipo Negro
                                    </button>
                                </div>
                                <button class="btn-cancelar-resultado" onclick="cancelarResultadoHistorial(${item.id})">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        listaHistorial.innerHTML = html;
    }

    function limpiarHistorial() {
        if (confirm('¿Estás seguro de que quieres eliminar todo el historial? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('historialEquipos');
            cargarHistorial();
            mostrarModalAlerta('Historial eliminado correctamente');
        }
    }



    // Nueva función para toggle de detalles del historial
    window.toggleHistorialItem = function(id) {
        const detalles = document.getElementById(`detalles-${id}`);
        const toggle = document.getElementById(`toggle-${id}`);
        const toggleText = toggle.querySelector('.toggle-text');
        const toggleIcon = toggle.querySelector('.toggle-icon');
        
        if (detalles.style.display === 'none') {
            detalles.style.display = 'block';
            toggleText.textContent = 'Ocultar equipos';
            toggleIcon.textContent = '🙈';
            toggle.classList.add('expanded');
        } else {
            detalles.style.display = 'none';
            toggleText.textContent = 'Ver equipos';
            toggleIcon.textContent = '👁️';
            toggle.classList.remove('expanded');
        }
    };

    // Funciones para manejar resultados en el historial
    window.mostrarOpcionesResultadoHistorial = function(id) {
        const opciones = document.getElementById(`opciones-resultado-${id}`);
        const estado = document.getElementById(`resultado-estado-${id}`);
        
        opciones.style.display = 'block';
        estado.style.display = 'none';
    };

    window.cancelarResultadoHistorial = function(id) {
        const opciones = document.getElementById(`opciones-resultado-${id}`);
        const estado = document.getElementById(`resultado-estado-${id}`);
        
        opciones.style.display = 'none';
        estado.style.display = 'block';
    };

    window.seleccionarResultadoHistorial = function(id, resultado) {
        let historial = JSON.parse(localStorage.getItem('historialEquipos') || '[]');
        const index = historial.findIndex(item => item.id === id);
        
        if (index !== -1) {
            historial[index].resultado = resultado;
            localStorage.setItem('historialEquipos', JSON.stringify(historial));
            cargarHistorial();
            
            let mensaje = '';
            switch(resultado) {
                case 'gano-blanco':
                    mensaje = 'Resultado guardado: Ganó Equipo Blanco';
                    break;
                case 'empate':
                    mensaje = 'Resultado guardado: Empate';
                    break;
                case 'gano-negro':
                    mensaje = 'Resultado guardado: Ganó Equipo Negro';
                    break;
            }
            mostrarModalAlerta(mensaje);
        }
    };

    // Hacer las funciones globales para que funcionen con onclick
    window.eliminarDelHistorial = function(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este registro del historial?')) {
            let historial = JSON.parse(localStorage.getItem('historialEquipos') || '[]');
            historial = historial.filter(item => item.id !== id);
            localStorage.setItem('historialEquipos', JSON.stringify(historial));
            cargarHistorial();
            mostrarModalAlerta('Registro eliminado del historial');
        }
    };

    window.cerrarModalHistorial = function() {
        modalHistorial.classList.add('modal-historial-oculto');
        modalHistorial.style.display = 'none';
        modalHistorial.style.visibility = 'hidden';
        modalHistorial.style.opacity = '0';
        // Restaurar scroll del body
        document.body.style.overflow = 'auto';
    };

    // Cerrar modal al hacer clic fuera del contenido
    modalHistorial.addEventListener('click', (e) => {
        if (e.target === modalHistorial) {
            window.cerrarModalHistorial();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalHistorial.classList.contains('modal-historial-oculto')) {
            window.cerrarModalHistorial();
        }
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
