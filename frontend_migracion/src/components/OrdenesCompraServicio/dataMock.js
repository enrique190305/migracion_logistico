// Datos de ejemplo para el módulo de Órdenes de Compra y Servicios

export const empresasMock = [
  { id: 1, razonSocial: 'Constructora El Sol S.A.C.', ruc: '20123456789' },
  { id: 2, razonSocial: 'Inversiones Perú Lima S.A.', ruc: '20987654321' },
  { id: 3, razonSocial: 'Grupo Empresarial Norte E.I.R.L.', ruc: '20456789123' }
];

export const proveedoresMock = [
  { 
    id: 1, 
    nombre: 'Distribuidora de Materiales del Norte S.A.C.', 
    ruc: '20111222333',
    direccion: 'Av. Industrial 123, Lima',
    telefono: '01-4567890'
  },
  { 
    id: 2, 
    nombre: 'Comercial Ferretera Central S.A.', 
    ruc: '20444555666',
    direccion: 'Jr. Los Constructores 456, Callao',
    telefono: '01-7890123'
  },
  { 
    id: 3, 
    nombre: 'Importaciones y Servicios Técnicos E.I.R.L.', 
    ruc: '20777888999',
    direccion: 'Av. Tomás Valle 789, Lima',
    telefono: '01-2345678'
  }
];

export const productosMock = [
  {
    id: 1,
    codigo: 'CEM-001',
    descripcion: 'Cemento Sol Tipo I x 42.5kg',
    unidadMedida: 'BLS',
    precioUnitario: 25.50,
    stock: 500
  },
  {
    id: 2,
    codigo: 'FIE-002',
    descripcion: 'Fierro de Construcción 1/2"',
    unidadMedida: 'VAR',
    precioUnitario: 35.00,
    stock: 200
  },
  {
    id: 3,
    codigo: 'ARE-003',
    descripcion: 'Arena Gruesa m³',
    unidadMedida: 'M3',
    precioUnitario: 80.00,
    stock: 50
  },
  {
    id: 4,
    codigo: 'PIE-004',
    descripcion: 'Piedra Chancada 1/2"',
    unidadMedida: 'M3',
    precioUnitario: 90.00,
    stock: 40
  },
  {
    id: 5,
    codigo: 'LAD-005',
    descripcion: 'Ladrillo King Kong 18 huecos',
    unidadMedida: 'MLL',
    precioUnitario: 650.00,
    stock: 100
  },
  {
    id: 6,
    codigo: 'TUB-006',
    descripcion: 'Tubo PVC 2" SAL',
    unidadMedida: 'UND',
    precioUnitario: 15.50,
    stock: 300
  }
];

export const serviciosMock = [
  {
    id: 1,
    codigo: 'SER-001',
    descripcion: 'Transporte de Material (Volquete 15m³)',
    unidadMedida: 'VJE',
    precioUnitario: 350.00
  },
  {
    id: 2,
    codigo: 'SER-002',
    descripcion: 'Instalación Eléctrica Residencial',
    unidadMedida: 'GLB',
    precioUnitario: 1500.00
  },
  {
    id: 3,
    codigo: 'SER-003',
    descripcion: 'Mantenimiento de Maquinaria',
    unidadMedida: 'HRS',
    precioUnitario: 80.00
  },
  {
    id: 4,
    codigo: 'SER-004',
    descripcion: 'Excavación con Retroexcavadora',
    unidadMedida: 'HRS',
    precioUnitario: 200.00
  },
  {
    id: 5,
    codigo: 'SER-005',
    descripcion: 'Instalación de Sistema de Riego',
    unidadMedida: 'GLB',
    precioUnitario: 2500.00
  }
];

export const monedasMock = [
  { id: 1, codigo: 'PEN', nombre: 'Soles', simbolo: 'S/' },
  { id: 2, codigo: 'USD', nombre: 'Dólares', simbolo: '$' }
];

export const unidadesMedidaMock = [
  { id: 1, codigo: 'UND', nombre: 'Unidad' },
  { id: 2, codigo: 'BLS', nombre: 'Bolsas' },
  { id: 3, codigo: 'KG', nombre: 'Kilogramos' },
  { id: 4, codigo: 'M3', nombre: 'Metro Cúbico' },
  { id: 5, codigo: 'M2', nombre: 'Metro Cuadrado' },
  { id: 6, codigo: 'ML', nombre: 'Metro Lineal' },
  { id: 7, codigo: 'MLL', nombre: 'Millar' },
  { id: 8, codigo: 'VAR', nombre: 'Varilla' },
  { id: 9, codigo: 'GLB', nombre: 'Global' },
  { id: 10, codigo: 'HRS', nombre: 'Horas' },
  { id: 11, codigo: 'VJE', nombre: 'Viaje' }
];
