// scrip.js - Sistema de Facturación Contable Corregido
class SistemaFacturacionContable {
    constructor() {
        this.catalogoCuentas = [
            { id: '1.1.1', cuenta: 'Caja', tipo: 'Activo', subtipo: 'Activo Circulante' },
            { id: '1.1.2', cuenta: 'Bancos', tipo: 'Activo', subtipo: 'Activo Circulante' },
            { id: '1.1.3', cuenta: 'Mercancia Inventario o Almacen', tipo: 'Activo', subtipo: 'Activo Circulante' },
            { id: '1.1.4', cuenta: 'IVA pagado', tipo: 'Activo', subtipo: 'Activo Circulante' },
            { id: '1.1.5', cuenta: 'IVA por acreditar', tipo: 'Activo', subtipo: 'Activo Circulante' },
            { id: '1.1.6', cuenta: 'Papelería', tipo: 'Activo', subtipo: 'Activo Circulante' },
            { id: '1.1.8', cuenta: 'Rentas pagadas por anticipado', tipo: 'Activo', subtipo: 'Activo Circulante' },
            { id: '1.2.1', cuenta: 'Edificios', tipo: 'Activo', subtipo: 'Activo No Circulante' },
            { id: '1.2.2', cuenta: 'Mobiliario', tipo: 'Activo', subtipo: 'Activo No Circulante' },
            { id: '1.2.3', cuenta: 'Equipo de cómputo', tipo: 'Activo', subtipo: 'Activo No Circulante' },
            { id: '1.2.4', cuenta: 'Equipo de Entrega', tipo: 'Activo', subtipo: 'Activo No Circulante' },
            { id: '1.2.5', cuenta: 'Equipo de Transporte', tipo: 'Activo', subtipo: 'Activo No Circulante' },
            { id: '1.2.6', cuenta: 'Gastos de instalación', tipo: 'Activo', subtipo: 'Activo No Circulante' },
            { id: '1.2.7', cuenta: 'Papelería y utiles', tipo: 'Activo', subtipo: 'Activo No Circulante' },
            { id: '2.1.1', cuenta: 'Documentos por pagar', tipo: 'Pasivo', subtipo: 'Pasivo Circulante' },
            { id: '2.1.2', cuenta: 'Acreedores', tipo: 'Pasivo', subtipo: 'Pasivo Circulante' },
            { id: '2.1.3', cuenta: 'Anticipo de clientes', tipo: 'Pasivo', subtipo: 'Pasivo Circulante' },
            { id: '2.1.4', cuenta: 'IVA trasladado', tipo: 'Pasivo', subtipo: 'Pasivo Circulante' },
            { id: '3.1.1', cuenta: 'Capital social', tipo: 'Capital Contable', subtipo: 'Capital contribuidor' }
        ];

        // Asiento de Apertura inicial
        this.saldosIniciales = {
            'Caja': 50000,
            'Bancos': 50000,
            'Mercancia Inventario o Almacen': 30000,
            'IVA pagado': 0,
            'IVA por acreditar': 0,
            'Papelería y utiles': 0,
            'Rentas pagadas por anticipado': 0,
            'Edificios': 8000,
            'Equipo de cómputo': 30000,
            'Equipo de Entrega': 60000,
            'Equipo de Transporte': 340000,
            'Mobiliario': 20000,
            'Documentos por pagar': 0,
            'Acreedores': 0,
            'Anticipo de clientes': 0,
            'IVA trasladado': 0,
            'Gastos de instalación': 15000,
            'Capital social': 603000
        };

        // Copia de los saldos iniciales para el balance actual
        this.saldosActuales = JSON.parse(JSON.stringify(this.saldosIniciales));

        // Cargar datos existentes
        this.transacciones = this.cargarDesdeLocalStorage('transacciones') || [];
        this.facturas = this.cargarDesdeLocalStorage('facturas') || [];
        this.transaccionIdCounter = this.cargarDesdeLocalStorage('transaccionIdCounter') || 1;
        this.facturaIdCounter = this.cargarDesdeLocalStorage('facturaIdCounter') || 1;

        // Recalcular saldos actuales basados en transacciones existentes
        this.recalcularSaldosActuales();

        this.inicializar();
    }

    recalcularSaldosActuales() {
        // Reiniciar saldos actuales a los iniciales
        this.saldosActuales = JSON.parse(JSON.stringify(this.saldosIniciales));

        // Aplicar todas las transacciones existentes
        this.transacciones.forEach(transaccion => {
            const cuentaData = this.catalogoCuentas.find(c => c.cuenta === transaccion.cuenta);
            if (!cuentaData) return;

            const tipoCuenta = cuentaData.tipo;

            // Aplicar reglas contables
            if (tipoCuenta === 'Activo') {
                this.saldosActuales[transaccion.cuenta] += (transaccion.cargo - transaccion.abono);
            } else if (tipoCuenta === 'Pasivo' || tipoCuenta === 'Capital Contable') {
                this.saldosActuales[transaccion.cuenta] += (transaccion.abono - transaccion.cargo);
            }
        });
    }

    inicializar() {
        this.configurarFechaActual();
        this.inicializarEventListeners();
        this.inicializarInterfaz();
    }

    configurarFechaActual() {
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('factura-fecha').value = hoy;
    }

    inicializarEventListeners() {
        // Formulario individual
        const formIndividual = document.getElementById('registro-form');
        if (formIndividual) {
            formIndividual.addEventListener('submit', (e) => this.manejarEnvioFormularioIndividual(e));
        }

        // Facturación
        const agregarItemBtn = document.getElementById('agregar-item');
        if (agregarItemBtn) {
            agregarItemBtn.addEventListener('click', () => this.agregarItemFactura());
        }

        const procesarFacturaBtn = document.getElementById('procesar-factura');
        if (procesarFacturaBtn) {
            procesarFacturaBtn.addEventListener('click', () => this.procesarFactura());
        }

        const limpiarFacturaBtn = document.getElementById('limpiar-factura');
        if (limpiarFacturaBtn) {
            limpiarFacturaBtn.addEventListener('click', () => this.limpiarFactura());
        }

        // Vistas
        const toggleVistaBtn = document.getElementById('toggle-vista');
        if (toggleVistaBtn) {
            toggleVistaBtn.addEventListener('click', () => this.alternarVista());
        }

        const cerrarFacturaBtn = document.getElementById('cerrar-factura');
        if (cerrarFacturaBtn) {
            cerrarFacturaBtn.addEventListener('click', () => this.cerrarModalFactura());
        }

        // Exportación
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportarCSV());
        }
    }

    inicializarInterfaz() {
        this.renderSelectOptions();
        this.renderApertura();
        this.renderBalance();
        this.renderHistory();
        this.renderFacturas();
    }

    renderSelectOptions() {
        const select = document.getElementById('cuenta');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccione una cuenta</option>';
        
        this.catalogoCuentas.forEach(cuenta => {
            const option = document.createElement('option');
            option.value = cuenta.cuenta;
            option.textContent = `${cuenta.id} - ${cuenta.cuenta}`;
            select.appendChild(option);
        });
    }

    // ========== ASIENTO DE APERTURA ==========
    renderApertura() {
        this.renderBalanceSection('apertura', this.saldosIniciales);
        
        const totalActivo = this.calcularTotalPorTipo('Activo', this.saldosIniciales);
        const totalPasivo = this.calcularTotalPorTipo('Pasivo', this.saldosIniciales);
        const totalCapital = this.calcularTotalPorTipo('Capital Contable', this.saldosIniciales);
        
        const diferencia = Math.abs(totalActivo - (totalPasivo + totalCapital));
        const balanceCheck = document.getElementById('apertura-balance-check');
        
        if (!balanceCheck) return;
        
        if (diferencia < 0.01) {
            balanceCheck.textContent = "✓ Asiento de Apertura Balanceado";
            balanceCheck.className = 'balance-message valid';
        } else {
            balanceCheck.textContent = `✗ Asiento de Apertura Desbalanceado - Diferencia: ${this.formatearMoneda(diferencia)}`;
            balanceCheck.className = 'balance-message invalid';
        }
    }

    // ========== BALANCE GENERAL ACTUAL ==========
   // ========== BALANCE GENERAL ACTUAL ==========
renderBalance() {
    this.renderBalanceSection('actual', this.saldosActuales);
    
    const totalActivo = this.calcularTotalPorTipo('Activo', this.saldosActuales);
    const totalPasivo = this.calcularTotalPorTipo('Pasivo', this.saldosActuales);
    const totalCapital = this.calcularTotalPorTipo('Capital Contable', this.saldosActuales);
    
    // Actualizar totales existentes (sin cambios)
    const totalPasivoCapital = totalPasivo + totalCapital;
    const diferencia = Math.abs(totalActivo - totalPasivoCapital);
    const balanceCheck = document.getElementById('balance-check');
    
    if (!balanceCheck) return;
    
    if (diferencia < 0.01) {
        balanceCheck.textContent = "¡El balance está equilibrado! ✅";
        balanceCheck.className = 'balance-message valid';
    } else {
        balanceCheck.textContent = `¡El balance no está equilibrado! ❌ Diferencia: ${this.formatearMoneda(diferencia)}`;
        balanceCheck.className = 'balance-message invalid';
    }

    // Nueva lógica: Actualizar ecuación contable
    const eqContainer = document.querySelector('.balance-equation');
    const eqTotalActivos = document.getElementById('eq-total-activos');
    const eqTotalPasivoCapital = document.getElementById('eq-total-pasivo-capital');

    if (eqTotalActivos) {
        eqTotalActivos.textContent = this.formatearMoneda(totalActivo);
        if (diferencia >= 0.01) {
            eqTotalActivos.classList.add('desbalanceado');
        } else {
            eqTotalActivos.classList.remove('desbalanceado');
        }
    }

    if (eqTotalPasivoCapital) {
        eqTotalPasivoCapital.textContent = this.formatearMoneda(totalPasivoCapital);
        if (diferencia >= 0.01) {
            eqTotalPasivoCapital.classList.add('desbalanceado');
        } else {
            eqTotalPasivoCapital.classList.remove('desbalanceado');
        }
    }

    if (eqContainer) {
        if (diferencia < 0.01) {
            eqContainer.classList.remove('desbalanceado');
            eqContainer.classList.add('equilibrado');
        } else {
            eqContainer.classList.remove('equilibrado');
            eqContainer.classList.add('desbalanceado');
        }
    }
}

    renderBalanceSection(tipo, saldos) {
        const prefix = tipo === 'apertura' ? 'apertura-' : '';
        
        // Activos
        const activoContainer = document.getElementById(`${prefix}activo-container`);
        if (activoContainer) {
            activoContainer.innerHTML = '';
            const activos = this.catalogoCuentas.filter(c => c.tipo === 'Activo');
            activos.forEach(item => {
                const saldo = saldos[item.cuenta] ?? 0;
                if (saldo !== 0) {
                    const div = document.createElement('div');
                    div.className = 'cuenta-item';
                    div.innerHTML = `<span>${item.cuenta}</span><span>${this.formatearMoneda(saldo)}</span>`;
                    activoContainer.appendChild(div);
                }
            });
        }

        // Pasivos
        const pasivoContainer = document.getElementById(`${prefix}pasivo-container`);
        if (pasivoContainer) {
            pasivoContainer.innerHTML = '';
            const pasivos = this.catalogoCuentas.filter(c => c.tipo === 'Pasivo');
            pasivos.forEach(item => {
                const saldo = saldos[item.cuenta] ?? 0;
                if (saldo !== 0) {
                    const div = document.createElement('div');
                    div.className = 'cuenta-item';
                    div.innerHTML = `<span>${item.cuenta}</span><span>${this.formatearMoneda(saldo)}</span>`;
                    pasivoContainer.appendChild(div);
                }
            });
        }

        // Capital
        const capitalContainer = document.getElementById(`${prefix}capital-container`);
        if (capitalContainer) {
            capitalContainer.innerHTML = '';
            const capital = this.catalogoCuentas.filter(c => c.tipo === 'Capital Contable');
            capital.forEach(item => {
                const saldo = saldos[item.cuenta] ?? 0;
                if (saldo !== 0) {
                    const div = document.createElement('div');
                    div.className = 'cuenta-item';
                    div.innerHTML = `<span>${item.cuenta}</span><span>${this.formatearMoneda(saldo)}</span>`;
                    capitalContainer.appendChild(div);
                }
            });
        }

        // Actualizar totales
        const totalActivo = this.calcularTotalPorTipo('Activo', saldos);
        const totalPasivo = this.calcularTotalPorTipo('Pasivo', saldos);
        const totalCapital = this.calcularTotalPorTipo('Capital Contable', saldos);

        const totalActivoElement = document.getElementById(`total-${prefix}activo`);
        const totalPasivoElement = document.getElementById(`total-${prefix}pasivo`);
        const totalCapitalElement = document.getElementById(`total-${prefix}capital`);

        if (totalActivoElement) totalActivoElement.textContent = this.formatearMoneda(totalActivo);
        if (totalPasivoElement) totalPasivoElement.textContent = this.formatearMoneda(totalPasivo);
        if (totalCapitalElement) totalCapitalElement.textContent = this.formatearMoneda(totalCapital);
    }

    calcularTotalPorTipo(tipo, saldos) {
        return this.catalogoCuentas
            .filter(c => c.tipo === tipo)
            .reduce((total, item) => total + (saldos[item.cuenta] ?? 0), 0);
    }

    // ========== SISTEMA DE FACTURACIÓN ==========
    agregarItemFactura() {
        const container = document.getElementById('factura-items-container');
        if (!container) return;
        
        const itemId = Date.now();
        
        const itemHTML = `
            <div class="factura-item" data-id="${itemId}">
                <select class="cuenta-item" required>
                    <option value="">Seleccione cuenta</option>
                    ${this.catalogoCuentas.map(cuenta => 
                        `<option value="${cuenta.cuenta}">${cuenta.id} - ${cuenta.cuenta}</option>`
                    ).join('')}
                </select>
                <input type="text" class="descripcion-item" placeholder="Descripción del movimiento">
                <input type="number" class="cargo-item" step="0.01" min="0" placeholder="0.00" value="0">
                <input type="number" class="abono-item" step="0.01" min="0" placeholder="0.00" value="0">
                <button type="button" class="btn-eliminar-item" onclick="sistema.eliminarItemFactura(${itemId})">×</button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', itemHTML);
        this.actualizarTotalesFactura();
        
        // Event listeners para los nuevos inputs
        const nuevoItem = container.lastElementChild;
        nuevoItem.querySelector('.cargo-item').addEventListener('input', () => this.actualizarTotalesFactura());
        nuevoItem.querySelector('.abono-item').addEventListener('input', () => this.actualizarTotalesFactura());
    }

    eliminarItemFactura(itemId) {
        const item = document.querySelector(`.factura-item[data-id="${itemId}"]`);
        if (item) {
            item.remove();
            this.actualizarTotalesFactura();
        }
    }

    actualizarTotalesFactura() {
        let totalCargos = 0;
        let totalAbonos = 0;

        document.querySelectorAll('.factura-item').forEach(item => {
            const cargo = parseFloat(item.querySelector('.cargo-item').value) || 0;
            const abono = parseFloat(item.querySelector('.abono-item').value) || 0;
            
            totalCargos += cargo;
            totalAbonos += abono;
        });

        const totalCargosElement = document.getElementById('total-cargos-factura');
        const totalAbonosElement = document.getElementById('total-abonos-factura');
        const diferenciaElement = document.getElementById('diferencia-factura');

        if (totalCargosElement) totalCargosElement.textContent = this.formatearMoneda(totalCargos);
        if (totalAbonosElement) totalAbonosElement.textContent = this.formatearMoneda(totalAbonos);
        
        const diferencia = totalCargos - totalAbonos;
        if (diferenciaElement) {
            diferenciaElement.textContent = this.formatearMoneda(Math.abs(diferencia));
            
            if (diferencia === 0) {
                diferenciaElement.parentElement.className = 'total-fila diferencia';
            } else if (diferencia > 0) {
                diferenciaElement.parentElement.className = 'total-fila diferencia positiva';
            } else {
                diferenciaElement.parentElement.className = 'total-fila diferencia negativa';
            }
        }
    }

    validarFactura() {
        const numero = document.getElementById('factura-numero')?.value.trim();
        const fecha = document.getElementById('factura-fecha')?.value;
        const cliente = document.getElementById('factura-cliente')?.value.trim();
        const items = document.querySelectorAll('.factura-item');

        if (!numero) {
            this.mostrarMensajeError("Ingrese un número de factura.");
            return false;
        }

        if (!fecha) {
            this.mostrarMensajeError("Seleccione una fecha para la factura.");
            return false;
        }

        if (!cliente) {
            this.mostrarMensajeError("Ingrese el nombre del cliente o proveedor.");
            return false;
        }

        if (items.length === 0) {
            this.mostrarMensajeError("Agregue al menos un item a la factura.");
            return false;
        }

        // Validar cada item
        for (let item of items) {
            const cuenta = item.querySelector('.cuenta-item').value;
            const cargo = parseFloat(item.querySelector('.cargo-item').value) || 0;
            const abono = parseFloat(item.querySelector('.abono-item').value) || 0;

            if (!cuenta) {
                this.mostrarMensajeError("Todas las cuentas deben estar seleccionadas.");
                return false;
            }

            if ((cargo > 0 && abono > 0) || (cargo === 0 && abono === 0)) {
                this.mostrarMensajeError("Cada item debe tener solo cargo o abono (no ambos ni ninguno).");
                return false;
            }
        }

        // Validar balance
        const totalCargos = parseFloat(document.getElementById('total-cargos-factura')?.textContent.replace(/[^0-9.-]+/g,"") || 0);
        const totalAbonos = parseFloat(document.getElementById('total-abonos-factura')?.textContent.replace(/[^0-9.-]+/g,"") || 0);
        
        if (totalCargos !== totalAbonos) {
            this.mostrarMensajeError("La factura no está balanceada. Los cargos deben igualar a los abonos.");
            return false;
        }

        return true;
    }

    procesarFactura() {
        if (!this.validarFactura()) return;

        const numero = document.getElementById('factura-numero').value.trim();
        const fecha = document.getElementById('factura-fecha').value;
        const cliente = document.getElementById('factura-cliente').value.trim();
        
        const factura = {
            id: this.facturaIdCounter++,
            numero: numero,
            fecha: fecha,
            cliente: cliente,
            items: [],
            timestamp: new Date().getTime()
        };

        // Procesar cada item
        document.querySelectorAll('.factura-item').forEach(itemElement => {
            const cuenta = itemElement.querySelector('.cuenta-item').value;
            const descripcion = itemElement.querySelector('.descripcion-item').value;
            const cargo = parseFloat(itemElement.querySelector('.cargo-item').value) || 0;
            const abono = parseFloat(itemElement.querySelector('.abono-item').value) || 0;

            const cuentaData = this.catalogoCuentas.find(c => c.cuenta === cuenta);
            if (!cuentaData) return;

            const tipoCuenta = cuentaData.tipo;

            // Aplicar reglas contables al balance actual
            if (tipoCuenta === 'Activo') {
                this.saldosActuales[cuenta] += (cargo - abono);
            } else if (tipoCuenta === 'Pasivo' || tipoCuenta === 'Capital Contable') {
                this.saldosActuales[cuenta] += (abono - cargo);
            }

            // Agregar item a la factura
            factura.items.push({
                cuenta: cuenta,
                descripcion: descripcion,
                cargo: cargo,
                abono: abono,
                tipoCuenta: tipoCuenta
            });

            // Registrar transacción
            const transaccion = {
                id: this.transaccionIdCounter++,
                facturaId: factura.id,
                facturaNumero: factura.numero,
                fecha: new Date(fecha).toLocaleDateString('es-MX'),
                cuenta: cuenta,
                cargo: cargo,
                abono: abono,
                descripcion: descripcion,
                timestamp: new Date().getTime()
            };

            this.transacciones.unshift(transaccion);
        });

        // Guardar datos
        this.facturas.unshift(factura);
        this.guardarEnLocalStorage('facturas', this.facturas);
        this.guardarEnLocalStorage('transacciones', this.transacciones);
        this.guardarEnLocalStorage('facturaIdCounter', this.facturaIdCounter);
        this.guardarEnLocalStorage('transaccionIdCounter', this.transaccionIdCounter);

        // Actualizar interfaz
        this.renderBalance();
        this.renderHistory();
        this.renderFacturas();
        this.limpiarFactura();

        this.mostrarMensajeExito(`Factura ${numero} procesada exitosamente.`);
    }

    limpiarFactura() {
        const facturaNumero = document.getElementById('factura-numero');
        const facturaCliente = document.getElementById('factura-cliente');
        const facturaItems = document.getElementById('factura-items-container');
        
        if (facturaNumero) facturaNumero.value = '';
        if (facturaCliente) facturaCliente.value = '';
        if (facturaItems) facturaItems.innerHTML = '';
        
        this.actualizarTotalesFactura();
        this.configurarFechaActual();
    }

    // ========== TRANSACCIONES INDIVIDUALES ==========
    manejarEnvioFormularioIndividual(e) {
        e.preventDefault();

        const cuenta = document.getElementById('cuenta').value.trim();
        const cargo = parseFloat(document.getElementById('cargo').value) || 0;
        const abono = parseFloat(document.getElementById('abono').value) || 0;

        if ((cargo > 0 && abono > 0) || (cargo === 0 && abono === 0)) {
            this.mostrarMensajeError("Ingrese solo Cargo o Abono (no ambos ni ninguno).");
            return;
        }

        const cuentaData = this.catalogoCuentas.find(c => c.cuenta === cuenta);
        if (!cuentaData) {
            this.mostrarMensajeError("Cuenta no encontrada en el catálogo.");
            return;
        }

        const tipoCuenta = cuentaData.tipo;

        // Aplicar reglas contables al balance actual
        if (tipoCuenta === 'Activo') {
            this.saldosActuales[cuenta] += (cargo - abono);
        } else if (tipoCuenta === 'Pasivo' || tipoCuenta === 'Capital Contable') {
            this.saldosActuales[cuenta] += (abono - cargo);
        }

        // Registrar transacción
        const transaccion = {
            id: this.transaccionIdCounter++,
            fecha: new Date().toLocaleDateString('es-MX'),
            cuenta: cuenta,
            cargo: cargo,
            abono: abono,
            timestamp: new Date().getTime()
        };

        this.transacciones.unshift(transaccion);

        // Guardar y actualizar
        this.guardarEnLocalStorage('transacciones', this.transacciones);
        this.guardarEnLocalStorage('transaccionIdCounter', this.transaccionIdCounter);
        this.renderBalance();
        this.renderHistory();

        // Limpiar formulario
        document.getElementById('registro-form').reset();
        this.mostrarMensajeExito("Movimiento registrado exitosamente.");
    }

    // ========== HISTORIAL Y FACTURAS ==========
    renderHistory() {
        const historyBody = document.getElementById('history-body');
        if (!historyBody) return;
        
        if (this.transacciones.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="5" class="no-data">No hay transacciones registradas</td></tr>';
            return;
        }

        historyBody.innerHTML = '';
        
        this.transacciones.forEach(tx => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tx.fecha}</td>
                <td>${tx.facturaNumero || '-'}</td>
                <td>${tx.cuenta}${tx.descripcion ? ` - ${tx.descripcion}` : ''}</td>
                <td class="text-right">${this.formatearMoneda(tx.cargo)}</td>
                <td class="text-right">${this.formatearMoneda(tx.abono)}</td>
            `;
            historyBody.appendChild(row);
        });
    }

    alternarVista() {
        const btn = document.getElementById('toggle-vista');
        const vistaTransacciones = document.getElementById('vista-transacciones');
        const vistaFacturas = document.getElementById('vista-facturas');

        if (!btn || !vistaTransacciones || !vistaFacturas) return;

        if (vistaTransacciones.classList.contains('vista-activa')) {
            vistaTransacciones.classList.remove('vista-activa');
            vistaTransacciones.classList.add('vista-oculta');
            vistaFacturas.classList.remove('vista-oculta');
            vistaFacturas.classList.add('vista-activa');
            btn.textContent = 'Ver Transacciones';
        } else {
            vistaFacturas.classList.remove('vista-activa');
            vistaFacturas.classList.add('vista-oculta');
            vistaTransacciones.classList.remove('vista-oculta');
            vistaTransacciones.classList.add('vista-activa');
            btn.textContent = 'Ver por Facturas';
        }
    }

    renderFacturas() {
        const facturasBody = document.getElementById('facturas-body');
        if (!facturasBody) return;
        
        if (this.facturas.length === 0) {
            facturasBody.innerHTML = '<tr><td colspan="5" class="no-data">No hay facturas registradas</td></tr>';
            return;
        }

        facturasBody.innerHTML = '';
        
        this.facturas.forEach(factura => {
            const total = factura.items.reduce((sum, item) => sum + item.cargo + item.abono, 0);
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${factura.numero}</td>
                <td>${new Date(factura.fecha).toLocaleDateString('es-MX')}</td>
                <td>${factura.cliente}</td>
                <td class="text-right">${this.formatearMoneda(total)}</td>
                <td>
                    <button class="btn-ver-factura" data-id="${factura.id}">Ver Detalles</button>
                </td>
            `;
            
            facturasBody.appendChild(row);
        });

        // Event listeners para botones de ver factura
        document.querySelectorAll('.btn-ver-factura').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const facturaId = parseInt(btn.dataset.id);
                this.mostrarDetallesFactura(facturaId);
            });
        });
    }

    mostrarDetallesFactura(facturaId) {
        const factura = this.facturas.find(f => f.id === facturaId);
        if (!factura) return;

        const modal = document.getElementById('factura-modal');
        const detalles = document.getElementById('factura-detalles');

        if (!modal || !detalles) return;

        let html = `
            <div class="factura-detalle">
                <div class="factura-detalle-header">
                    <h4>Factura: ${factura.numero}</h4>
                    <p>Cliente: ${factura.cliente} | Fecha: ${new Date(factura.fecha).toLocaleDateString('es-MX')}</p>
                </div>
                <div class="factura-detalle-items">
                    <div class="factura-detalle-item header">
                        <span>Cuenta</span>
                        <span>Descripción</span>
                        <span class="text-right">Cargo</span>
                        <span class="text-right">Abono</span>
                    </div>
        `;

        factura.items.forEach(item => {
            html += `
                <div class="factura-detalle-item">
                    <span>${item.cuenta}</span>
                    <span>${item.descripcion || '-'}</span>
                    <span class="text-right">${this.formatearMoneda(item.cargo)}</span>
                    <span class="text-right">${this.formatearMoneda(item.abono)}</span>
                </div>
            `;
        });

        const totalCargos = factura.items.reduce((sum, item) => sum + item.cargo, 0);
        const totalAbonos = factura.items.reduce((sum, item) => sum + item.abono, 0);

        html += `
                </div>
                <div class="factura-detalle-totales">
                    <div class="total-fila">
                        <span>Total Cargos:</span>
                        <span>${this.formatearMoneda(totalCargos)}</span>
                    </div>
                    <div class="total-fila">
                        <span>Total Abonos:</span>
                        <span>${this.formatearMoneda(totalAbonos)}</span>
                    </div>
                </div>
            </div>
        `;

        detalles.innerHTML = html;
        modal.style.display = 'flex';
    }

    cerrarModalFactura() {
        const modal = document.getElementById('factura-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ========== UTILIDADES ==========
    guardarEnLocalStorage(clave, datos) {
        try {
            localStorage.setItem(clave, JSON.stringify(datos));
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            return false;
        }
    }

    cargarDesdeLocalStorage(clave) {
        try {
            const datos = localStorage.getItem(clave);
            return datos ? JSON.parse(datos) : null;
        } catch (error) {
            console.error('Error al cargar desde localStorage:', error);
            return null;
        }
    }

    formatearMoneda(monto) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(monto);
    }

    mostrarMensajeError(mensaje) {
        alert('Error: ' + mensaje);
    }

    mostrarMensajeExito(mensaje) {
        alert('Éxito: ' + mensaje);
    }

    exportarCSV() {
        if (this.transacciones.length === 0) {
            this.mostrarMensajeError("No hay transacciones para exportar.");
            return;
        }

        const headers = ['Fecha', 'Factura', 'Cuenta', 'Descripción', 'Cargo', 'Abono'];
        const csvContent = [
            headers.join(','),
            ...this.transacciones.map(tx => [
                tx.fecha,
                tx.facturaNumero || '',
                `"${tx.cuenta}"`,
                `"${tx.descripcion || ''}"`,
                tx.cargo,
                tx.abono
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.mostrarMensajeExito("Archivo CSV exportado exitosamente.");
    }
}

// Inicializar el sistema cuando se carga la página
let sistema;
document.addEventListener('DOMContentLoaded', () => {
    sistema = new SistemaFacturacionContable();
});