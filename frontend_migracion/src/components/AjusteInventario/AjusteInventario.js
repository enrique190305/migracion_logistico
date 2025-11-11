import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/authService';
import './AjusteInventario.css';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

function AjusteInventario() {
  // Estados principales
  const [inventario, setInventario] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    id_bodega: '',
    buscar: ''
  });

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados del modal de ajuste
  const [modalAjuste, setModalAjuste] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [detalleProducto, setDetalleProducto] = useState(null);
  const [ajusteForm, setAjusteForm] = useState({
    tipo_ajuste: 'CANTIDAD',
    cantidad_nueva: '',
    precio_nuevo: '',
    motivo: '',
    observaciones: '',
    documento_referencia: ''
  });

  // Estados del modal de historial
  const [modalHistorial, setModalHistorial] = useState(false);
  const [historialProducto, setHistorialProducto] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarBodegas();
    cargarInventario();
  }, []);

  // Cargar catálogos
  const cargarBodegas = async () => {
    try {
      const response = await apiClient.get('/ajuste-inventario/bodegas');
      if (response.data.success) {
        setBodegas(response.data.bodegas);
      }
    } catch (error) {
      console.error('Error al cargar bodegas:', error);
    }
  };

  // Cargar inventario con filtros
  const cargarInventario = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filtros.id_bodega) params.append('id_bodega', filtros.id_bodega);
      if (filtros.buscar) params.append('buscar', filtros.buscar);

      const response = await apiClient.get(`/ajuste-inventario/inventario?${params}`);
      if (response.data.success) {
        setInventario(response.data.inventario);
      }
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      setError('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de ajuste
  const abrirModalAjuste = async (producto) => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/ajuste-inventario/detalle/${producto.codigo_producto}/${producto.id_bodega}`
      );
      if (response.data.success) {
        setProductoSeleccionado(producto);
        setDetalleProducto(response.data.detalle);
        setHistorialProducto(response.data.historial || []);
        setAjusteForm({
          tipo_ajuste: 'CANTIDAD',
          cantidad_nueva: response.data.detalle.cantidad_disponible,
          precio_nuevo: response.data.detalle.precio_unitario,
          motivo: '',
          observaciones: '',
          documento_referencia: ''
        });
        setModalAjuste(true);
      }
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      setError('Error al cargar detalle del producto');
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal de ajuste
  const cerrarModalAjuste = () => {
    setModalAjuste(false);
    setProductoSeleccionado(null);
    setDetalleProducto(null);
    setAjusteForm({
      tipo_ajuste: 'CANTIDAD',
      cantidad_nueva: '',
      precio_nuevo: '',
      motivo: '',
      observaciones: '',
      documento_referencia: ''
    });
  };

  // Realizar ajuste
  const realizarAjuste = async () => {
    if (!ajusteForm.motivo.trim()) {
      setError('El motivo del ajuste es obligatorio');
      return;
    }

    if (ajusteForm.tipo_ajuste === 'CANTIDAD' || ajusteForm.tipo_ajuste === 'AMBOS') {
      if (!ajusteForm.cantidad_nueva || ajusteForm.cantidad_nueva < 0) {
        setError('La cantidad nueva debe ser mayor o igual a 0');
        return;
      }
    }

    if (ajusteForm.tipo_ajuste === 'VALORACION' || ajusteForm.tipo_ajuste === 'AMBOS') {
      if (!ajusteForm.precio_nuevo || ajusteForm.precio_nuevo < 0) {
        setError('El precio nuevo debe ser mayor o igual a 0');
        return;
      }
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        codigo_producto: productoSeleccionado.codigo_producto,
        id_bodega: productoSeleccionado.id_bodega,
        id_reserva: productoSeleccionado.id_reserva || null,
        tipo_ajuste: ajusteForm.tipo_ajuste,
        cantidad_nueva: parseFloat(ajusteForm.cantidad_nueva),
        precio_nuevo: parseFloat(ajusteForm.precio_nuevo),
        motivo: ajusteForm.motivo,
        observaciones: ajusteForm.observaciones,
        documento_referencia: ajusteForm.documento_referencia
      };

      const response = await apiClient.post('/ajuste-inventario/ajustar', payload);
      
      if (response.data.success) {
        setSuccess(`Ajuste realizado exitosamente: ${response.data.message}`);
        cerrarModalAjuste();
        cargarInventario();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (error) {
      console.error('Error al realizar ajuste:', error);
      setError(error.response?.data?.message || 'Error al realizar ajuste');
    } finally {
      setLoading(false);
    }
  };

  // Exportar inventario
  const exportarInventario = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.id_bodega) params.append('id_bodega', filtros.id_bodega);
      if (filtros.id_reserva) params.append('id_reserva', filtros.id_reserva);

      const response = await apiClient.get(`/ajuste-inventario/exportar?${params}`);
      
      if (response.data.success) {
        // Convertir a CSV
        const datos = response.data.datos;
        const headers = ['Código', 'Producto', 'Unidad', 'Bodega', 'Reserva', 'Cantidad Disp.', 'Cantidad Res.', 'Total', 'Precio Unit.', 'Valor Total'];
        const csv = [
          headers.join(','),
          ...datos.map(item => [
            item.codigo_producto,
            `"${item.nombre_producto}"`,
            item.unidad_medida,
            `"${item.bodega}"`,
            `"${item.reserva}"`,
            item.cantidad_disponible,
            item.cantidad_reservada,
            item.cantidad_total,
            item.precio_unitario,
            item.valor_total
          ].join(','))
        ].join('\n');

        // Descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `inventario_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSuccess('Inventario exportado exitosamente');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      setError('Error al exportar inventario');
    } finally {
      setLoading(false);
    }
  };

  // Calcular diferencias para el preview
  const calcularDiferencias = () => {
    if (!detalleProducto) return null;

    const diferenciasCantidad = parseFloat(ajusteForm.cantidad_nueva || 0) - parseFloat(detalleProducto.cantidad_disponible);
    const diferenciasPrecio = parseFloat(ajusteForm.precio_nuevo || 0) - parseFloat(detalleProducto.precio_unitario);
    const valorAnterior = detalleProducto.cantidad_disponible * detalleProducto.precio_unitario;
    const valorNuevo = parseFloat(ajusteForm.cantidad_nueva || 0) * parseFloat(ajusteForm.precio_nuevo || 0);
    const diferenciaValor = valorNuevo - valorAnterior;

    return {
      diferenciasCantidad,
      diferenciasPrecio,
      valorAnterior,
      valorNuevo,
      diferenciaValor
    };
  };

  // Formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor || 0);
  };

  // Formatear número
  const formatearNumero = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor || 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          <InventoryIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} />
          Ajuste de Inventario
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona y ajusta las cantidades y valorizaciones de tu inventario
        </Typography>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5} sx={{ minWidth: '300px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Bodega</InputLabel>
                <Select
                  value={filtros.id_bodega}
                  onChange={(e) => setFiltros({ ...filtros, id_bodega: e.target.value })}
                  label="Bodega"
                >
                  <MenuItem value="">Todas las bodegas</MenuItem>
                  {bodegas.map((bodega) => (
                    <MenuItem key={bodega.id_bodega} value={bodega.id_bodega}>
                      {bodega.nombre}
                    </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={5} sx={{ minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Buscar producto"
                    value={filtros.buscar}
                    onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={cargarInventario}
                    disabled={loading}
                  >
                    Buscar
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => {
                        setFiltros({ id_bodega: '', buscar: '' });
                        cargarInventario();
                      }}
                    >
                      Limpiar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={exportarInventario}
                      disabled={loading || inventario.length === 0}
                    >
                      Exportar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tabla de Inventario */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Productos en Inventario ({inventario.length})
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Código</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Producto</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Bodega</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Cantidad</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Precio Unit.</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Valor Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventario.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="text.secondary">
                              No se encontraron productos
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        inventario.map((item) => (
                          <TableRow key={item.id_stock} hover>
                            <TableCell>
                              <Chip label={item.codigo_producto} size="small" color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.nombre_producto}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.unidad_medida}
                              </Typography>
                            </TableCell>
                            <TableCell>{item.nombre_bodega}</TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                {formatearNumero(item.cantidad_disponible)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {formatearMoneda(item.precio_unitario)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                {formatearMoneda(item.valor_total)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Ajustar Inventario">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => abrirModalAjuste(item)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

      {/* Modal de Ajuste */}
      <Dialog
        open={modalAjuste}
        onClose={cerrarModalAjuste}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            Ajustar Inventario
          </Box>
          <IconButton onClick={cerrarModalAjuste} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detalleProducto && (
            <>
              {/* Información del producto */}
              <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {detalleProducto.nombre_producto}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Código: {detalleProducto.codigo_producto} | Unidad: {detalleProducto.unidad_medida}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Bodega</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{detalleProducto.nombre_bodega}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Reserva</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{detalleProducto.tipo_reserva}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Cantidad Actual</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {formatearNumero(detalleProducto.cantidad_disponible)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Precio Actual</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {formatearMoneda(detalleProducto.precio_unitario)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Formulario de ajuste */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Ajuste</InputLabel>
                    <Select
                      value={ajusteForm.tipo_ajuste}
                      onChange={(e) => setAjusteForm({ ...ajusteForm, tipo_ajuste: e.target.value })}
                      label="Tipo de Ajuste"
                    >
                      <MenuItem value="CANTIDAD">Solo Cantidad</MenuItem>
                      <MenuItem value="VALORACION">Solo Valorización</MenuItem>
                      <MenuItem value="AMBOS">Cantidad y Valorización</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {(ajusteForm.tipo_ajuste === 'CANTIDAD' || ajusteForm.tipo_ajuste === 'AMBOS') && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cantidad Nueva"
                      type="number"
                      value={ajusteForm.cantidad_nueva}
                      onChange={(e) => setAjusteForm({ ...ajusteForm, cantidad_nueva: e.target.value })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><InventoryIcon /></InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                )}

                {(ajusteForm.tipo_ajuste === 'VALORACION' || ajusteForm.tipo_ajuste === 'AMBOS') && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Precio Unitario Nuevo"
                      type="number"
                      value={ajusteForm.precio_nuevo}
                      onChange={(e) => setAjusteForm({ ...ajusteForm, precio_nuevo: e.target.value })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><MoneyIcon /></InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Motivo del Ajuste"
                    value={ajusteForm.motivo}
                    onChange={(e) => setAjusteForm({ ...ajusteForm, motivo: e.target.value })}
                    placeholder="Ej: Inventario físico, merma, corrección de error..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones"
                    multiline
                    rows={3}
                    value={ajusteForm.observaciones}
                    onChange={(e) => setAjusteForm({ ...ajusteForm, observaciones: e.target.value })}
                    placeholder="Detalles adicionales sobre el ajuste..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Documento de Referencia"
                    value={ajusteForm.documento_referencia}
                    onChange={(e) => setAjusteForm({ ...ajusteForm, documento_referencia: e.target.value })}
                    placeholder="Ej: INV-2025-001, AJUSTE-2025-001..."
                  />
                </Grid>
              </Grid>

              {/* Preview de cambios */}
              {ajusteForm.motivo && calcularDiferencias() && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Card sx={{ bgcolor: '#e3f2fd' }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Vista Previa de Cambios
                      </Typography>
                      <Grid container spacing={2}>
                        {(ajusteForm.tipo_ajuste === 'CANTIDAD' || ajusteForm.tipo_ajuste === 'AMBOS') && (
                          <Grid item xs={12} md={4}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Diferencia de Cantidad</Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 'bold',
                                  color: calcularDiferencias().diferenciasCantidad >= 0 ? '#2e7d32' : '#d32f2f'
                                }}
                              >
                                {calcularDiferencias().diferenciasCantidad >= 0 ? '+' : ''}
                                {formatearNumero(calcularDiferencias().diferenciasCantidad)}
                                {calcularDiferencias().diferenciasCantidad >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {(ajusteForm.tipo_ajuste === 'VALORACION' || ajusteForm.tipo_ajuste === 'AMBOS') && (
                          <Grid item xs={12} md={4}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Diferencia de Precio</Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 'bold',
                                  color: calcularDiferencias().diferenciasPrecio >= 0 ? '#2e7d32' : '#d32f2f'
                                }}
                              >
                                {formatearMoneda(calcularDiferencias().diferenciasPrecio)}
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        <Grid item xs={12} md={4}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Diferencia de Valor Total</Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 'bold',
                                color: calcularDiferencias().diferenciaValor >= 0 ? '#2e7d32' : '#d32f2f'
                              }}
                            >
                              {formatearMoneda(calcularDiferencias().diferenciaValor)}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Valor Anterior</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {formatearMoneda(calcularDiferencias().valorAnterior)}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Valor Nuevo</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                            {formatearMoneda(calcularDiferencias().valorNuevo)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Historial reciente */}
              {historialProducto.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Últimos Movimientos
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell align="right">Cantidad</TableCell>
                          <TableCell align="right">Precio</TableCell>
                          <TableCell>Documento</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {historialProducto.slice(0, 5).map((mov, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="caption">
                                {new Date(mov.fecha).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={mov.tipo_movimiento}
                                size="small"
                                color={mov.tipo_movimiento === 'INGRESO' ? 'success' : mov.tipo_movimiento === 'SALIDA' ? 'error' : 'warning'}
                              />
                            </TableCell>
                            <TableCell align="right">{formatearNumero(mov.cantidad)}</TableCell>
                            <TableCell align="right">{formatearMoneda(mov.precio_unitario)}</TableCell>
                            <TableCell>
                              <Typography variant="caption">{mov.documento}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalAjuste} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={realizarAjuste}
            disabled={loading || !ajusteForm.motivo}
            startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {loading ? 'Procesando...' : 'Realizar Ajuste'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AjusteInventario;
