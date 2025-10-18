using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using MySql.Data.MySqlClient;
using System.IO;
using GenracionOC;

namespace GenracionOC
{
    public partial class Ordenes_de_Compra : Form
    {

        public Ordenes_de_Compra()
        {
            InitializeComponent();

            // Ensure form content can scroll on smaller screens and cap size to working area
            this.AutoScroll = true;
            try
            {
                var wa = Screen.FromControl(this).WorkingArea;
                int maxW = (int)(wa.Width * 0.95);
                int maxH = (int)(wa.Height * 0.95);
                this.MaximumSize = new Size(maxW, maxH);
                if (this.ClientSize.Width > maxW || this.ClientSize.Height > maxH)
                {
                    this.ClientSize = new Size(Math.Min(this.ClientSize.Width, maxW), Math.Min(this.ClientSize.Height, maxH));
                }
                this.StartPosition = FormStartPosition.CenterScreen;
            }
            catch { /* ignore screen detection errors */ }

            // Attach responsive helper so the form scales on different screens
            ResponsiveHelper.Attach(this);

            // Habilitar autocompletado y escritura en cmbCodigo igual que comboBoxUser en Prestamo
            cmbCodigo.DropDownStyle = ComboBoxStyle.DropDown;
            cmbCodigo.AutoCompleteMode = AutoCompleteMode.SuggestAppend;
            cmbCodigo.AutoCompleteSource = AutoCompleteSource.CustomSource;

            // Initialize modern design
            InitializeModernDesign();

            CargarEmpresas();
            CargarProveedores();
            CargarMonedas();
            CargarCodigosProducto();
            InicializarDataGridView();
            
            // MEJORA: Agregar menú contextual para eliminar productos
            InicializarMenuContextual();

            // SOLUCIÓN PROBLEMA 1: Remover event handlers duplicados para evitar ejecución doble
            // Solo registrar eventos programáticamente aquí, no en el Designer
            cmbProveedor.SelectedIndexChanged += cmbProveedor_SelectedIndexChanged;
            cmbCodigo.SelectedIndexChanged += cmbCodigo_SelectedIndexChanged;
            txtCantidad.TextChanged += txtCantidad_TextChanged;
            txtPrecioU.TextChanged += txtPrecioU_TextChanged;
            
            // IMPORTANTE: Estos NO se registran aquí porque ya están en el Designer
            // btnInsertar.Click += btnInsertar_Click;
            // btnBorrar.Click += btnBorrar_Click;
            // btnGuardar.Click += btnGuardar_Click;
            
            rbCompra.CheckedChanged += rbCompra_CheckedChanged;
            rbServicio.CheckedChanged += rbServicio_CheckedChanged;
        }
        
        private void InicializarMenuContextual()
        {
            // Crear menú contextual para el DataGridView
            ContextMenuStrip menuContextual = new ContextMenuStrip();
            
            ToolStripMenuItem eliminarItem = new ToolStripMenuItem();
            eliminarItem.Text = "??? Eliminar producto(s) seleccionado(s)";
            eliminarItem.Click += (s, e) => btnBorrar_Click(s, e);
            eliminarItem.Font = new Font("Segoe UI", 9F, FontStyle.Regular);
            
            ToolStripMenuItem infoItem = new ToolStripMenuItem();
            infoItem.Text = "?? Ver información del producto";
            infoItem.Click += (s, e) => {
                if (dataGridViewProductos.SelectedRows.Count > 0 && !dataGridViewProductos.SelectedRows[0].IsNewRow)
                {
                    DataGridViewProductos_CellDoubleClick(dataGridViewProductos, 
                        new DataGridViewCellEventArgs(0, dataGridViewProductos.SelectedRows[0].Index));
                }
                else
                {
                    MessageBox.Show("Seleccione un producto para ver su información.", 
                        "Producto no seleccionado", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            };
            infoItem.Font = new Font("Segoe UI", 9F, FontStyle.Regular);
            
            ToolStripMenuItem eliminarTodosItem = new ToolStripMenuItem();
            eliminarTodosItem.Text = "?? Limpiar toda la lista";
            eliminarTodosItem.Click += (s, e) => {
                if (dataGridViewProductos.Rows.Count > 0)
                {
                    var confirmar = MessageBox.Show(
                        "¿Está seguro que desea eliminar TODOS los productos de la lista?\n\n" +
                        $"Se eliminarán {dataGridViewProductos.Rows.Count} producto(s).\n\n" +
                        "Esta acción no se puede deshacer.", 
                        "Confirmar eliminación masiva", 
                        MessageBoxButtons.YesNo, 
                        MessageBoxIcon.Warning);
                        
                    if (confirmar == DialogResult.Yes)
                    {
                        int cantidadEliminada = dataGridViewProductos.Rows.Count;
                        dataGridViewProductos.Rows.Clear();
                        ActualizarTotalesGenerales();
                        MessageBox.Show($"Se eliminaron {cantidadEliminada} producto(s) de la lista.", 
                            "Lista limpiada", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                }
                else
                {
                    MessageBox.Show("La lista de productos ya está vacía.", 
                        "Lista vacía", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            };
            eliminarTodosItem.Font = new Font("Segoe UI", 9F, FontStyle.Regular);
            
            // Separador visual
            ToolStripSeparator separador1 = new ToolStripSeparator();
            ToolStripSeparator separador2 = new ToolStripSeparator();
            
            // Agregar items al menú
            menuContextual.Items.Add(eliminarItem);
            menuContextual.Items.Add(separador1);
            menuContextual.Items.Add(infoItem);
            menuContextual.Items.Add(separador2);
            menuContextual.Items.Add(eliminarTodosItem);
            
            // Configurar estilo del menú contextual
            menuContextual.BackColor = Color.White;
            menuContextual.ForeColor = Color.FromArgb(52, 73, 94);
            
            dataGridViewProductos.ContextMenuStrip = menuContextual;
        }

        private void InitializeModernDesign()
        {
            // Enable double buffering for smoother rendering
            this.SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.UserPaint | ControlStyles.DoubleBuffer, true);

            // Setup modern button styles
            SetupModernButtons();

            // Setup hover effects for controls
            SetupHoverEffects();
        }

        private void SetupModernButtons()
        {
            Button[] buttons = { btnInsertar, btnGuardar };

            foreach (var btn in buttons)
            {
                btn.FlatAppearance.BorderSize = 0;
                btn.Cursor = Cursors.Hand;

                // Add rounded corners effect
                btn.Paint += ModernButton_Paint;

                // Add hover effects
                btn.MouseEnter += (s, e) =>
                {
                    var button = s as Button;
                    button.Font = new Font(button.Font.FontFamily, button.Font.Size + 0.5f, FontStyle.Bold);
                };

                btn.MouseLeave += (s, e) =>
                {
                    var button = s as Button;
                    button.Font = new Font(button.Font.FontFamily, button.Font.Size - 0.5f, FontStyle.Bold);
                };
            }
        }

        private void ModernButton_Paint(object sender, PaintEventArgs e)
        {
            var btn = sender as Button;
            var rect = new Rectangle(0, 0, btn.Width, btn.Height);

            using (var brush = new SolidBrush(btn.BackColor))
            using (var path = GetRoundedRectPath(rect, 8))
            {
                e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                e.Graphics.FillPath(brush, path);

                // Add subtle shadow effect
                if (btn.ClientRectangle.Contains(btn.PointToClient(Cursor.Position)))
                {
                    using (var shadowBrush = new SolidBrush(Color.FromArgb(40, 0, 0, 0)))
                    using (var shadowPath = GetRoundedRectPath(new Rectangle(2, 2, rect.Width - 4, rect.Height - 4), 6))
                    {
                        e.Graphics.FillPath(shadowBrush, shadowPath);
                    }
                }
            }

            // Draw the button text
            using (var textBrush = new SolidBrush(btn.ForeColor))
            {
                var stringFormat = new StringFormat
                {
                    Alignment = StringAlignment.Center,
                    LineAlignment = StringAlignment.Center
                };

                e.Graphics.DrawString(btn.Text, btn.Font, textBrush, rect, stringFormat);
            }
        }

        private System.Drawing.Drawing2D.GraphicsPath GetRoundedRectPath(Rectangle rect, int radius)
        {
            var path = new System.Drawing.Drawing2D.GraphicsPath();
            path.AddArc(rect.X, rect.Y, radius, radius, 180, 90);
            path.AddArc(rect.X + rect.Width - radius, rect.Y, radius, radius, 270, 90);
            path.AddArc(rect.X + rect.Width - radius, rect.Y + rect.Height - radius, radius, radius, 0, 90);
            path.AddArc(rect.X, rect.Y + rect.Height - radius, radius, radius, 90, 90);
            path.CloseAllFigures();
            return path;
        }

        private void SetupHoverEffects()
        {
            // Add subtle hover effects to ComboBoxes
            ComboBox[] comboBoxes = { cmbRazon, cmbProveedor, cmbMoneda, cmbCodigo };

            foreach (var cmb in comboBoxes)
            {
                cmb.MouseEnter += (s, e) =>
                {
                    var comboBox = s as ComboBox;
                    comboBox.BackColor = Color.FromArgb(240, 248, 255);
                };

                cmb.MouseLeave += (s, e) =>
                {
                    var comboBox = s as ComboBox;
                    comboBox.BackColor = Color.White;
                };
            }

            // Adicionar efectos de hover a TextBoxes
            TextBox[] textBoxes = { txtNumero, txtLatitud, txtLongitud, txtDestino,
                                  txtUMedida, txtDescripcion, txtPrecioU, txtCantidad, txtSubTotal };

            foreach (var txt in textBoxes)
            {
                txt.MouseEnter += (s, e) =>
                {
                    var textBox = s as TextBox;
                    if (textBox.Enabled)
                        textBox.BackColor = Color.FromArgb(240, 248, 255);
                };

                txt.MouseLeave += (s, e) =>
                {
                    var textBox = s as TextBox;
                    if (textBox.Enabled)
                        textBox.BackColor = Color.White;
                };
            }
        }

        private void CargarEmpresas()
        {
            using (MySqlConnection conn = ConexionDB.GetConnection())
            {
                conn.Open();
                MySqlDataAdapter da = new MySqlDataAdapter("SELECT id_empresa, razon_social FROM EMPRESA", conn);
                DataTable dt = new DataTable();
                da.Fill(dt);
                cmbRazon.DataSource = dt;
                cmbRazon.DisplayMember = "razon_social";
                cmbRazon.ValueMember = "id_empresa";
                cmbRazon.SelectedIndex = -1; // <-- Vacío al iniciar
            }
        }

        private void CargarProveedores()
        {
            using (MySqlConnection conn = ConexionDB.GetConnection())
            {
                conn.Open();
                MySqlDataAdapter da = new MySqlDataAdapter("SELECT id_proveedor, nombre FROM PROVEEDOR", conn);
                DataTable dt = new DataTable();
                da.Fill(dt);
                cmbProveedor.DataSource = dt;
                cmbProveedor.DisplayMember = "nombre";
                cmbProveedor.ValueMember = "id_proveedor";
                cmbProveedor.SelectedIndex = -1; // <-- Vacío al iniciar
            }
        }

        private void CargarMonedas()
        {
            using (MySqlConnection conn = ConexionDB.GetConnection())
            {
                conn.Open();
                MySqlDataAdapter da = new MySqlDataAdapter("SELECT id_moneda, tipo_moneda FROM MONEDA", conn);
                DataTable dt = new DataTable();
                da.Fill(dt);
                cmbMoneda.DataSource = dt;
                cmbMoneda.DisplayMember = "tipo_moneda";
                cmbMoneda.ValueMember = "id_moneda";
                cmbMoneda.SelectedIndex = -1; // <-- Vacío al iniciar
            }
        }

        private void CargarCodigosProducto()
        {
            try
            {
                using (MySqlConnection conn = ConexionDB.GetConnection())
                {
                    conn.Open();
                    MySqlDataAdapter da = new MySqlDataAdapter(@"
                        SELECT codigo_producto, descripcion, unidad 
                        FROM PRODUCTO 
                        WHERE codigo_producto IS NOT NULL 
                        AND codigo_producto != '' 
                        AND descripcion IS NOT NULL 
                        AND descripcion != ''
                        ORDER BY descripcion", conn); // Ordenar por descripción para facilitar la búsqueda
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    if (dt.Rows.Count == 0)
                    {
                        MessageBox.Show("?? No se encontraron productos en la base de datos.\n\nPor favor, registre productos antes de crear órdenes.", 
                            "Sin productos", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }

                    cmbCodigo.DataSource = dt;
                    cmbCodigo.DisplayMember = "descripcion";
                    cmbCodigo.ValueMember = "descripcion";
                    cmbCodigo.SelectedIndex = -1;

                    // Autocompletado personalizado igual que comboBoxUser en Prestamo
                    var autoSource = new AutoCompleteStringCollection();
                    foreach (DataRow row in dt.Rows)
                    {
                        if (!string.IsNullOrWhiteSpace(row["descripcion"].ToString()))
                            autoSource.Add(row["descripcion"].ToString());
                    }
                    cmbCodigo.AutoCompleteCustomSource = autoSource;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"? Error al cargar productos: {ex.Message}", 
                    "Error de carga", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void InicializarDataGridView()
        {
            dataGridViewProductos.Columns.Clear();
            dataGridViewProductos.Columns.Add("Codigo", "CÓDIGO");
            dataGridViewProductos.Columns.Add("Descripcion", "DESCRIPCIÓN");
            dataGridViewProductos.Columns.Add("Cantidad", "CANTIDAD");
            dataGridViewProductos.Columns.Add("Unidad", "UNIDAD");
            dataGridViewProductos.Columns.Add("PrecioUnitario", "P. UNIT.");
            dataGridViewProductos.Columns.Add("Subtotal", "SUBTOTAL");
            dataGridViewProductos.Columns.Add("Total", "TOTAL");
            dataGridViewProductos.AllowUserToAddRows = false;
            dataGridViewProductos.RowHeadersVisible = true; // CAMBIO: Mostrar headers para mejor selección
            dataGridViewProductos.RowHeadersWidth = 25; // Ancho pequeño para los headers
            
            // MEJORA: Configurar selección completa de filas para facilitar eliminación
            dataGridViewProductos.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dataGridViewProductos.MultiSelect = true;
            dataGridViewProductos.ReadOnly = true; // Solo lectura para evitar edición accidental
            
            // MEJORA: Colores alternados para mejor legibilidad
            dataGridViewProductos.AlternatingRowsDefaultCellStyle.BackColor = Color.FromArgb(248, 249, 250);
            dataGridViewProductos.DefaultCellStyle.SelectionBackColor = Color.FromArgb(52, 152, 219);
            dataGridViewProductos.DefaultCellStyle.SelectionForeColor = Color.White;
            
            // MEJORA: Estilo de encabezados
            dataGridViewProductos.ColumnHeadersDefaultCellStyle.BackColor = Color.FromArgb(52, 73, 94);
            dataGridViewProductos.ColumnHeadersDefaultCellStyle.ForeColor = Color.White;
            dataGridViewProductos.ColumnHeadersDefaultCellStyle.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            dataGridViewProductos.EnableHeadersVisualStyles = false;
            dataGridViewProductos.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.DisableResizing;
            dataGridViewProductos.ColumnHeadersHeight = 30;
            
            // MEJORA: Estilo de headers de fila
            dataGridViewProductos.RowHeadersDefaultCellStyle.BackColor = Color.FromArgb(69, 90, 100);
            dataGridViewProductos.RowHeadersDefaultCellStyle.ForeColor = Color.White;
            dataGridViewProductos.RowHeadersDefaultCellStyle.SelectionBackColor = Color.FromArgb(41, 128, 185);
            
            // MEJORA: Ancho automático de columnas
            dataGridViewProductos.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            dataGridViewProductos.Columns["Codigo"].FillWeight = 15;
            dataGridViewProductos.Columns["Descripcion"].FillWeight = 35;
            dataGridViewProductos.Columns["Cantidad"].FillWeight = 10;
            dataGridViewProductos.Columns["Unidad"].FillWeight = 10;
            dataGridViewProductos.Columns["PrecioUnitario"].FillWeight = 15;
            dataGridViewProductos.Columns["Subtotal"].FillWeight = 15;
            dataGridViewProductos.Columns["Total"].FillWeight = 15;
            
            // MEJORA: Agregar evento de teclado para eliminar con tecla Delete
            dataGridViewProductos.KeyDown += (sender, e) => {
                if (e.KeyCode == Keys.Delete)
                {
                    btnBorrar_Click(sender, e);
                    e.Handled = true;
                }
                else if (e.KeyCode == Keys.F2)
                {
                    // Mostrar información del producto con F2
                    if (dataGridViewProductos.SelectedRows.Count > 0 && !dataGridViewProductos.SelectedRows[0].IsNewRow)
                    {
                        DataGridViewProductos_CellDoubleClick(dataGridViewProductos, 
                            new DataGridViewCellEventArgs(0, dataGridViewProductos.SelectedRows[0].Index));
                    }
                    e.Handled = true;
                }
            };
            
            // MEJORA: Agregar evento de doble clic para mostrar información
            dataGridViewProductos.CellDoubleClick += DataGridViewProductos_CellDoubleClick;
        }
        
        private void DataGridViewProductos_CellDoubleClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0 && !dataGridViewProductos.Rows[e.RowIndex].IsNewRow)
            {
                var fila = dataGridViewProductos.Rows[e.RowIndex];
                string codigo = fila.Cells["Codigo"].Value?.ToString() ?? "";
                string descripcion = fila.Cells["Descripcion"].Value?.ToString() ?? "";
                string cantidad = fila.Cells["Cantidad"].Value?.ToString() ?? "";
                string precioU = fila.Cells["PrecioUnitario"].Value?.ToString() ?? "";
                string total = fila.Cells["Total"].Value?.ToString() ?? "";
                
                MessageBox.Show($"?? INFORMACIÓN DEL PRODUCTO\n\n" +
                    $"Código: {codigo}\n" +
                    $"Descripción: {descripcion}\n" +
                    $"Cantidad: {cantidad}\n" +
                    $"Precio Unitario: {precioU}\n" +
                    $"Total: {total}\n\n" +
                    $"?? Tip: Haga clic derecho o presione Delete para eliminar",
                    "Información del Producto", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void lblUMedida_Click(object sender, EventArgs e)
        {

        }

        private void txtObservaciones_TextChanged(object sender, EventArgs e)
        {

        }

        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void label4_Click(object sender, EventArgs e)
        {

        }

        private void lblFechaReq_Click(object sender, EventArgs e)
        {

        }

        private void cmbRazon_SelectedIndexChanged(object sender, EventArgs e)
        {

        }

        private void cmbProveedor_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (cmbProveedor.SelectedIndex >= 0)
            {
                int idProveedor = Convert.ToInt32(cmbProveedor.SelectedValue);
                using (MySqlConnection conn = ConexionDB.GetConnection())
                {
                    conn.Open();
                    MySqlCommand cmd = new MySqlCommand(
                        "SELECT ruc, direccion, contacto, celular, correo, forma_pago FROM PROVEEDOR WHERE id_proveedor = @id", conn);
                    cmd.Parameters.AddWithValue("@id", idProveedor);
                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        listBox1.Items.Clear();
                        if (reader.Read())
                        {
                            listBox1.Items.Add($"RUC: {reader["ruc"]}");
                            listBox1.Items.Add($"Dirección: {reader["direccion"]}");
                            listBox1.Items.Add($"Contacto: {reader["contacto"]}");
                            listBox1.Items.Add($"Celular: {reader["celular"]}");
                            listBox1.Items.Add($"Correo: {reader["correo"]}");
                            listBox1.Items.Add($"Forma de pago: {reader["forma_pago"]}");
                        }
                    }
                }
            }
        }

        private void cmbCodigo_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (cmbCodigo.SelectedIndex >= 0)
            {
                // MODIFICACIÓN: Buscar por descripción seleccionada y autocompletar código y unidad
                string descripcionProducto = cmbCodigo.SelectedValue.ToString();
                using (MySqlConnection conn = ConexionDB.GetConnection())
                {
                    conn.Open();
                    MySqlCommand cmd = new MySqlCommand(
                        "SELECT codigo_producto, unidad FROM PRODUCTO WHERE descripcion = @descripcion", conn);
                    cmd.Parameters.AddWithValue("@descripcion", descripcionProducto);
                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            // CAMBIO: Invertir campos - mostrar código en txtDescripcion y mantener unidad
                            txtDescripcion.Text = reader["codigo_producto"].ToString(); // Mostrar código del producto
                            txtUMedida.Text = reader["unidad"].ToString();
                        }
                    }
                }
            }
            else
            {
                // Limpiar campos cuando no hay selección
                txtDescripcion.Text = ""; // Limpiar código
                txtUMedida.Text = "";
            }
        }

        private void txtCantidad_TextChanged(object sender, EventArgs e)
        {
            CalcularTotales();
        }

        private void txtPrecioU_TextChanged(object sender, EventArgs e)
        {
            CalcularTotales();

            // PROBLEMA CORREGIDO: Ahora el correlativo se basará en el total del RESUMEN FINANCIERO
            // en lugar del total individual del producto que se está añadiendo
            
            // No generar correlativo aquí basado en el producto individual
            // El correlativo se generará cuando se actualicen los totales generales
            // o cuando se vaya a guardar la orden basándose en el total acumulado del DataGridView
        }

        private void CalcularTotales()
        {
            if (double.TryParse(txtCantidad.Text, out double cantidad) && double.TryParse(txtPrecioU.Text, out double precio))
            {
                double subtotal = cantidad * precio;
                double totalConIGV = subtotal * 1.18;

                // Obtener el símbolo de moneda basado en la selección
                string simboloMoneda = ObtenerSimboloMoneda();

                txtSubTotal.Text = FormatearMoneda(subtotal, simboloMoneda);
                txtTotal.Text = FormatearMoneda(totalConIGV, simboloMoneda);
            }
            else
            {
                txtSubTotal.Text = "";
                txtTotal.Text = "";
            }
        }

        private string ObtenerSimboloMoneda()
        {
            if (cmbMoneda.SelectedItem != null)
            {
                string tipoMoneda = cmbMoneda.Text.ToUpper().Trim();

                switch (tipoMoneda)
                {
                    case "DÓLARES":
                    case "DOLARES":
                    case "USD":
                    case "DOLLAR":
                    case "DOLLARS":
                        return "$";
                    case "SOLES":
                    case "SOL":
                    case "PEN":
                    case "NUEVOS SOLES":
                        return "S/";
                    default:
                        return "S/"; // Por defecto soles
                }
            }
            return "S/"; // Por defecto soles si no hay selección
        }

        private string FormatearMoneda(double valor, string simbolo)
        {
            if (simbolo == "$")
            {
                return $"${valor:N2}";
            }
            else
            {
                return $"S/ {valor:N2}";
            }
        }

        private void btnInsertar_Click(object sender, EventArgs e)
        {
            // PROTECCIÓN CONTRA DOBLE CLIC
            btnInsertar.Enabled = false;
            string textOriginal = btnInsertar.Text;
            btnInsertar.Text = "? Procesando...";

            try
            {
                // Validaciones antes de insertar
                if (string.IsNullOrWhiteSpace(cmbCodigo.Text))
                {
                    MessageBox.Show("?? Debe seleccionar una descripción de producto válida.", "Producto requerido", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                if (string.IsNullOrWhiteSpace(txtDescripcion.Text))
                {
                    MessageBox.Show("?? Debe seleccionar un producto que tenga código.", "Código requerido", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                if (string.IsNullOrWhiteSpace(txtCantidad.Text) || !int.TryParse(txtCantidad.Text, out int cantidad) || cantidad <= 0)
                {
                    MessageBox.Show("?? Debe ingresar una cantidad válida mayor que 0.", "Cantidad inválida", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                if (string.IsNullOrWhiteSpace(txtPrecioU.Text) || !double.TryParse(txtPrecioU.Text, out double precio) || precio <= 0)
                {
                    MessageBox.Show("?? Debe ingresar un precio unitario válido mayor que 0.", "Precio inválido", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                if (cmbMoneda.SelectedValue == null)
                {
                    MessageBox.Show("?? Debe seleccionar una moneda.", "Moneda requerida", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                // Verificar que el producto existe en la base de datos usando la descripción
                if (!ValidarProductoExistePorDescripcion(cmbCodigo.Text))
                {
                    MessageBox.Show($"?? El producto '{cmbCodigo.Text}' no existe en la base de datos.\n\nPor favor, seleccione un producto válido de la lista.", 
                        "Producto no encontrado", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                // Si todas las validaciones pasan, proceder con la inserción
                // Agregar fila al DataGridView
                string codigo = txtDescripcion.Text;      // El código ahora está en txtDescripcion
                string descripcion = cmbCodigo.Text;      // La descripción ahora está en cmbCodigo
                string cantidadStr = txtCantidad.Text;
                string unidad = txtUMedida.Text;

                // Formatear precio unitario with el símbolo de moneda
                string simboloMoneda = ObtenerSimboloMoneda();
                string precioUnitario = "";
                if (double.TryParse(txtPrecioU.Text, out double precioNum))
                {
                    precioUnitario = FormatearMoneda(precioNum, simboloMoneda);
                }

                string subtotal = txtSubTotal.Text;
                string total = txtTotal.Text;

                dataGridViewProductos.Rows.Add(codigo, descripcion, cantidadStr, unidad, precioUnitario, subtotal, total);

                // Limpiar campos para el siguiente ítem
                cmbCodigo.SelectedIndex = -1;     // ComboBox de descripción
                txtDescripcion.Text = "";         // Campo de código
                txtCantidad.Text = "";
                txtUMedida.Text = "";
                txtPrecioU.Text = "";
                txtSubTotal.Text = "";
                txtTotal.Text = "";

                // Actualizar IGV y Total general
                ActualizarTotalesGenerales();

                // Mostrar mensaje de éxito BREVE para no molestar al usuario
                // MessageBox.Show($"? Producto '{codigo}' agregado correctamente.", 
                //     "Producto agregado", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"? Error al agregar el producto: {ex.Message}", 
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                // RESTAURAR ESTADO DEL BOTÓN
                btnInsertar.Text = textOriginal;
                btnInsertar.Enabled = true;
            }
        }

        private bool ValidarProductoExistePorDescripcion(string descripcionProducto)
        {
            if (string.IsNullOrWhiteSpace(descripcionProducto))
                return false;

            try
            {
                using (MySqlConnection conn = ConexionDB.GetConnection())
                {
                    conn.Open();
                    string query = "SELECT COUNT(*) FROM PRODUCTO WHERE descripcion = @descripcion";
                    using (MySqlCommand cmd = new MySqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@descripcion", descripcionProducto.Trim());
                        int count = Convert.ToInt32(cmd.ExecuteScalar());
                        return count > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"? Error al validar el producto: {ex.Message}", 
                    "Error de validación", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return false;
            }
        }

        private bool ValidarProductoExiste(string codigoProducto)
        {
            if (string.IsNullOrWhiteSpace(codigoProducto))
                return false;

            try
            {
                using (MySqlConnection conn = ConexionDB.GetConnection())
                {
                    conn.Open();
                    string query = "SELECT COUNT(*) FROM PRODUCTO WHERE codigo_producto = @codigo";
                    using (MySqlCommand cmd = new MySqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@codigo", codigoProducto.Trim());
                        int count = Convert.ToInt32(cmd.ExecuteScalar());
                        return count > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"? Error al validar el producto: {ex.Message}", 
                    "Error de validación", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return false;
            }
        }

        private void btnBorrar_Click(object sender, EventArgs e)
        {
            // SOLUCIÓN PROBLEMA 2: Funcionalidad mejorada del botón borrar
            try
            {
                if (dataGridViewProductos.Rows.Count == 0)
                {
                    MessageBox.Show("?? No hay productos en la lista para eliminar.", 
                        "Lista vacía", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    return;
                }

                if (dataGridViewProductos.SelectedRows.Count > 0)
                {
                    // Si hay filas seleccionadas, eliminar las seleccionadas
                    List<DataGridViewRow> filasAEliminar = new List<DataGridViewRow>();
                    List<string> productosEliminados = new List<string>();
                    
                    foreach (DataGridViewRow fila in dataGridViewProductos.SelectedRows)
                    {
                        if (!fila.IsNewRow)
                        {
                            string codigoProducto = fila.Cells["Codigo"].Value?.ToString() ?? "Sin código";
                            filasAEliminar.Add(fila);
                            productosEliminados.Add(codigoProducto);
                        }
                    }
                    
                    if (filasAEliminar.Count > 0)
                    {
                        var confirmar = MessageBox.Show(
                            $"¿Está seguro que desea eliminar {filasAEliminar.Count} producto(s) de la lista?\n\n" +
                            $"Productos a eliminar:\n• {string.Join("\n• ", productosEliminados)}", 
                            "Confirmar eliminación múltiple", 
                            MessageBoxButtons.YesNo, 
                            MessageBoxIcon.Question);
                            
                        if (confirmar == DialogResult.Yes)
                        {
                            foreach (var fila in filasAEliminar)
                            {
                                dataGridViewProductos.Rows.Remove(fila);
                            }
                            
                            // MEJORADO: Actualizar totales generales Y correlativo
                            ActualizarTotalesGenerales();
                            
                            MessageBox.Show($"? {filasAEliminar.Count} producto(s) eliminado(s) correctamente.", 
                                "Productos eliminados", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        }
                    }
                }
                else if (dataGridViewProductos.CurrentRow != null && !dataGridViewProductos.CurrentRow.IsNewRow)
                {
                    // Si no hay filas seleccionadas pero hay una fila actual, eliminar la fila actual
                    string codigoProducto = dataGridViewProductos.CurrentRow.Cells["Codigo"].Value?.ToString() ?? "Sin código";
                    
                    var confirmar = MessageBox.Show(
                        $"¿Está seguro que desea eliminar el producto '{ codigoProducto }' de la lista?", 
                        "Confirmar eliminación", 
                        MessageBoxButtons.YesNo, 
                        MessageBoxIcon.Question);
                        
                    if (confirmar == DialogResult.Yes)
                    {
                        int rowIndex = dataGridViewProductos.CurrentRow.Index;
                        dataGridViewProductos.Rows.RemoveAt(rowIndex);
                        
                        // MEJORADO: Actualizar totales generales Y correlativo
                        ActualizarTotalesGenerales();
                        
                        MessageBox.Show($"? Producto '{codigoProducto}' eliminado correctamente.", 
                            "Producto eliminado", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                }
                else
                {
                    MessageBox.Show("?? Seleccione una fila de producto para eliminar.\n\n" +
                        "?? Consejos:\n" +
                        "• Haga clic en el número de fila (lado izquierdo) para seleccionar toda la fila\n" +
                        "• Use Ctrl+clic para seleccionar múltiples filas\n" +
                        "• También puede hacer clic derecho para acceder al menú contextual\n" +
                        "• O presionar la tecla Delete después de seleccionar", 
                        "Seleccione producto a eliminar", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"? Error al eliminar producto(s): {ex.Message}", 
                    "Error de eliminación", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void HabilitarCamposCompra(bool habilitar)
        {
            cmbCodigo.Enabled = habilitar;
            txtCantidad.Enabled = habilitar;
            txtPrecioU.Enabled = habilitar;

            // Siempre deshabilitados
            txtUMedida.Enabled = false;
            txtSubTotal.Enabled = false;
            txtTotal.Enabled = false;
            txtDescripcion.Enabled = false;

            // Bloquear campos de ubicación y fecha requerida solo en COMPRA
            txtLatitud.Enabled = !habilitar;
            txtLongitud.Enabled = !habilitar;
            txtDestino.Enabled = !habilitar;
            dtpFechaReq.Enabled = !habilitar;
        }

        // Método para obtener el siguiente ID de orden de compra
        private int GetNextOrdenCompraId()
        {
            using (MySqlConnection conn = ConexionDB.GetConnection())
            {
                conn.Open();
                MySqlCommand cmd = new MySqlCommand("SELECT IFNULL(MAX(id_oc), 0) + 1 FROM ORDEN_COMPRA", conn);
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        private int GetNextOrdenServicioId()
        {
            using (MySqlConnection conn = ConexionDB.GetConnection())
            {
                conn.Open();
                MySqlCommand cmd = new MySqlCommand("SELECT IFNULL(MAX(id_os), 0) + 1 FROM ORDEN_SERVICIO", conn);
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        private void rbCompra_CheckedChanged(object sender, EventArgs e)
        {
            if (rbCompra.Checked)
            {
                txtLatitud.Clear();
                txtLongitud.Clear();
                txtDestino.Clear();

                HabilitarCamposCompra(true);
                
                // MEJORADO: Generar correlativo basado en el total del resumen financiero
                ActualizarCorrelativoPorTipoSeleccionado();
                
                // Siempre deshabilitados
                txtUMedida.Enabled = false;
                txtSubTotal.Enabled = false;
                txtTotal.Enabled = false;
                txtDescripcion.Enabled = false;
            }
        }


        private void rbServicio_CheckedChanged(object sender, EventArgs e)
        {
            if (rbServicio.Checked)
            {
                // En servicio, todo habilitado menos los campos que deben estar deshabilitados
                cmbCodigo.Enabled = true;
                txtCantidad.Enabled = true;
                txtPrecioU.Enabled = true;
                txtLatitud.Enabled = true;
                txtLongitud.Enabled = true;
                txtDestino.Enabled = true;
                dtpFechaReq.Enabled = true;
                
                // MEJORADO: Generar correlativo basado en el total del resumen financiero
                ActualizarCorrelativoPorTipoSeleccionado();
                
                // Siempre deshabilitados
                txtUMedida.Enabled = false;
                txtSubTotal.Enabled = false;
                txtTotal.Enabled = false;
                txtDescripcion.Enabled = false;
            }
        }
        
        /// <summary>
        /// Actualiza el correlativo cuando se selecciona un tipo de orden,
        /// basándose en el total actual del resumen financiero
        /// </summary>
        private void ActualizarCorrelativoPorTipoSeleccionado()
        {
            // Obtener el total actual del resumen financiero
            double totalGeneral = 0;
            
            // Intentar obtener el total de los labels del resumen financiero
            if (label4 != null && !string.IsNullOrEmpty(label4.Text))
            {
                string totalStr = label4.Text.Replace("S/", "").Replace("$", "").Replace(",", "").Trim();
                if (double.TryParse(totalStr, out double totalFromLabel))
                {
                    totalGeneral = totalFromLabel;
                }
            }
            
            // Si no hay total en los labels, calcularlo desde el DataGridView
            if (totalGeneral == 0)
            {
                foreach (DataGridViewRow row in dataGridViewProductos.Rows)
                {
                    if (!row.IsNewRow)
                    {
                        string totalRowStr = row.Cells["Total"].Value?.ToString()?.Replace("S/", "").Replace("$", "").Replace(",", "").Trim();
                        if (double.TryParse(totalRowStr, out double totalRow))
                        {
                            totalGeneral += totalRow;
                        }
                    }
                }
            }
            
            // Actualizar correlativo basándose en el total general
            ActualizarCorrelativoPorTotalGeneral(totalGeneral);
        }

        private (string ruc, string direccion) GetProveedorRucDireccion()
        {
            string ruc = "";
            string direccion = "";
            if (cmbProveedor.SelectedIndex >= 0)
            {
                int idProveedor = Convert.ToInt32(cmbProveedor.SelectedValue);
                using (MySqlConnection conn = ConexionDB.GetConnection())
                {
                    conn.Open();
                    MySqlCommand cmd = new MySqlCommand("SELECT ruc, direccion FROM PROVEEDOR WHERE id_proveedor = @id", conn);
                    cmd.Parameters.AddWithValue("@id", idProveedor);
                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            ruc = reader["ruc"].ToString();
                            direccion = reader["direccion"].ToString();
                        }
                    }
                }
            }
            return (ruc, direccion);
        }

        private void GenerarOrdenPDF(string correlativo, string tipoOrden)
        {
            try
            {
                // Obtener RUC y dirección del proveedor
                var proveedorInfo = GetProveedorRucDireccion();
                string simboloMoneda = ObtenerSimboloMoneda();

                // Generar HTML basado en el diseño de Ingreso de Materiales
                string htmlContent = GenerarHtmlOrden(correlativo, tipoOrden, proveedorInfo, simboloMoneda);

                SaveFileDialog saveDialog = new SaveFileDialog
                {
                    Filter = "Archivos PDF (*.pdf)|*.pdf",
                    Title = $"Guardar {tipoOrden}",
                    FileName = $"{tipoOrden.Replace(" ", "_")}_{correlativo}_{cmbProveedor.Text}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf",
                    DefaultExt = "pdf"
                };

                if (saveDialog.ShowDialog() == DialogResult.OK)
                {
                    // Usar PdfManager para generar el PDF de manera segura
                    byte[] pdfBytes = PdfManager.GeneratePdfSafely(htmlContent);
                    File.WriteAllBytes(saveDialog.FileName, pdfBytes);
                    
                    DialogResult openFile = MessageBox.Show(
                        $"? PDF de {tipoOrden} generado exitosamente:\n\n?? {saveDialog.FileName}\n\n¿Desea abrir el archivo?", 
                        "PDF Creado", MessageBoxButtons.YesNo, MessageBoxIcon.Information);
                    
                    if (openFile == DialogResult.Yes)
                    {
                        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                        {
                            FileName = saveDialog.FileName,
                            UseShellExecute = true
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"? Error al generar PDF: {ex.Message}", "Error de PDF", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private string GenerarHtmlOrden(string correlativo, string tipoOrden, (string ruc, string direccion) proveedorInfo, string simboloMoneda)
        {
            var html = new StringBuilder();

            // Calcular totales
            decimal subtotalGeneral = 0;
            decimal totalItems = 0;
            foreach (DataGridViewRow row in dataGridViewProductos.Rows)
            {
                if (!row.IsNewRow)
                {
                    string subtotalStr = row.Cells["Subtotal"].Value?.ToString()?.Replace("S/", "").Replace("$", "").Replace(",", "").Trim();
                    if (decimal.TryParse(subtotalStr, out decimal subtotal))
                    {
                        subtotalGeneral += subtotal;
                    }
                    totalItems++;
                }
            }

            decimal igvCalculado = subtotalGeneral * 0.18m;
            decimal totalGeneral = subtotalGeneral + igvCalculado;

            // HTML optimizado basado en el diseño de Ingreso de Materiales
            html.Append(@"<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>").Append(EscapeHtml(tipoOrden)).Append(@"</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        @page {
            size: A4;
            margin: 12mm 12mm 12mm 12mm;
        }
        html, body {
            width: 100%;
            min-height: 100%;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #333;
            height: 277mm;
            min-height: 277mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            line-height: 1.35;
        }
        .header { 
            text-align: center; 
            margin-bottom: 18px; 
            border-bottom: 2px solid #003366; 
            padding-bottom: 12px; 
        }
        .company-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #003366; 
            margin-bottom: 8px; 
        }
        .document-type { 
            font-size: 15px; 
            font-weight: bold; 
            color: #34495e; 
            margin-bottom: 5px; 
        }
        .document-number-box { 
            background-color: #f8f9fa; 
            border: 1px solid #bdc3c7; 
            padding: 8px 15px; 
            margin: 10px auto; 
            display: inline-block; 
            border-radius: 4px; 
        }
        .document-number { 
            font-size: 13px; 
            font-weight: bold; 
            color: #003366; 
            margin: 0; 
        }
        .fecha-emision { 
            font-size: 10px; 
            color: #666; 
            font-style: italic; 
            margin-top: 5px; 
        }
        .info-section { 
            margin: 18px 0; 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 4px; 
            border: 1px solid #e9ecef; 
        }
        .info-grid { 
            display: table; 
            width: 100%; 
            margin-bottom: 10px; 
        }
        .info-row { 
            display: table-row; 
        }
        .info-label { 
            display: table-cell; 
            font-weight: bold; 
            color: #003366; 
            width: 25%; 
            padding: 4px 10px 4px 0; 
        }
        .info-value { 
            display: table-cell; 
            color: #34495e; 
            padding: 4px 0; 
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 12px; 
            font-size: 10px;
        }
        th, td { 
            border: 1px solid #003366; 
            padding: 7px 8px; 
            text-align: left; 
            vertical-align: top;
        }
        th { 
            background-color: #e6f0fa; 
            color: #003366; 
            font-weight: bold;
            text-align: center;
        }
        .details-section { 
            margin: 18px 0; 
        }
        .details-title { 
            font-size: 14px; 
            font-weight: bold; 
            color: #003366; 
            margin-bottom: 10px; 
            padding-bottom: 5px; 
            border-bottom: 1px solid #bdc3c7; 
        }
        .totals-section { 
            margin-top: 18px; 
            text-align: right; 
        }
        .totals-table { 
            margin-left: auto; 
            width: 300px; 
            border-collapse: collapse; 
        }
        .totals-table td { 
            padding: 8px 12px; 
            border: 1px solid #003366; 
            font-weight: bold; 
        }
        .totals-table .total-label { 
            background-color: #e6f0fa; 
            color: #003366; 
            text-align: right; 
            width: 60%; 
        }
        .totals-table .total-value { 
            text-align: right; 
            width: 40%; 
            color: #003366; 
        }
        .service-details { 
            margin: 14px 0; 
            background-color: #fff3cd; 
            border: 1px solid #856404; 
            border-radius: 4px; 
            padding: 15px; 
        }
        .service-details-title { 
            font-size: 12px; 
            font-weight: bold; 
            color: #856404; 
            margin-bottom: 10px; 
        }
        .service-details table { 
            font-size: 10px; 
        }
        .service-details td { 
            border: 1px solid #856404; 
            padding: 6px; 
        }
        .conditions { 
            margin-top: 20px; 
            font-size: 9px; 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 4px; 
            border: 1px solid #e9ecef; 
        }
        .conditions h4 { 
            color: #003366; 
            margin-bottom: 10px; 
            font-size: 11px; 
        }
        .conditions p { 
            line-height: 1.5; 
        }
        .signature { 
            margin-top: 30px; 
            text-align: left; 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 4px; 
            border: 1px solid #e9ecef; 
        }
        .signature-line { 
            border-top: 1px solid #003366; 
            width: 250px; 
            margin: 20px 0 10px 0; 
        }
        .footer-info { 
            text-align: center; 
            font-size: 9px; 
            color: #666; 
            margin-top: 40px !important;
            padding-top: 18px !important;
            border-top: none !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
        }
        
        /* NUEVO: CSS para centrar contenido dentro de .signature */
        .signature {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 0 !important;
            margin-top: 0 !important;
        }
        .signature-content {
            text-align: center;
            width: 100%;
        }
        .signature-line {
            border-top: 1.5px solid #003366 !important;
            width: 220px !important;
            margin: 32px auto 16px auto !important;
        }
        .conditions {
            margin-bottom: 10px !important;
        }
        .footer-info {
            margin-top: 40px !important;
            padding-top: 18px !important;
            font-size: 9px !important;
            border-top: none !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
        }
    </style>
</head>
<body>");

            // Header
            html.Append($@"
    <div class='header'>
        <div class='company-title'>SISTEMA DE GESTIÓN DE MATERIALES</div>
        <div class='document-type'>{EscapeHtml(tipoOrden)}</div>
        <div class='document-number-box'>
            <div class='document-number'>DOCUMENTO N°: {EscapeHtml(correlativo)}</div>
            <div class='fecha-emision'>Fecha de emisión: {DateTime.Now:dd/MM/yyyy}</div>
        </div>
    </div>");

            // Información general
            html.Append($@"
    <div class='info-section'>
        <div class='info-grid'>
            <div class='info-row'>
                <div class='info-label'>Empresa:</div>
                <div class='info-value'>{EscapeHtml(cmbRazon.Text)}</div>
            </div>
            <div class='info-row'>
                <div class='info-label'>Fecha:</div>
                <div class='info-value'>{dtpFecha.Value:dd/MM/yyyy}</div>
            </div>
            <div class='info-row'>
                <div class='info-label'>Proveedor:</div>
                <div class='info-value'>{EscapeHtml(cmbProveedor.Text)}</div>
            </div>
            <div class='info-row'>
                <div class='info-label'>RUC:</div>
                <div class='info-value'>{EscapeHtml(proveedorInfo.ruc)}</div>
            </div>
            <div class='info-row'>
                <div class='info-label'>Dirección:</div>
                <div class='info-value'>{EscapeHtml(proveedorInfo.direccion)}</div>
            </div>
            <div class='info-row'>
                <div class='info-label'>Moneda:</div>
                <div class='info-value'>{EscapeHtml(cmbMoneda.Text)}</div>
            </div>
            <div class='info-row'>
                <div class='info-label'>Fecha Requerida:</div>
                <div class='info-value'>{dtpFechaReq.Value:dd/MM/yyyy}</div>
            </div>
        </div>
    </div>");

            // Detalles del servicio (solo para OS o ID con detalles de servicio)
            bool esServicioConDetalles = tipoOrden == "ORDEN DE SERVICIO" || (tipoOrden == "INGRESO DIRECTO" && !string.IsNullOrWhiteSpace(txtLatitud.Text + txtLongitud.Text + txtDestino.Text));
            if (esServicioConDetalles)
            {
                html.Append(@"<style>
                    html, body { height: 100vh !important; min-height: 100vh !important; }
                    body { font-size: 12px !important; margin: 0 !important; height: 100vh !important; min-height: 100vh !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; }
                    .header { margin-bottom: 10px !important; padding-bottom: 8px !important; }
                    .info-section { margin: 8px 0 !important; padding: 10px !important; }
                    .service-details { margin: 8px 0 !important; padding: 10px !important; min-height: 40px !important; }
                    .details-section { margin: 8px 0 !important; }
                    .details-title { margin-bottom: 6px !important; padding-bottom: 2px !important; font-size: 12px !important; }
                    table, th, td { font-size: 11px !important; padding: 6px 7px !important; }
                    .totals-section { margin-top: 8px !important; }
                    .totals-table td { padding: 7px 10px !important; }
                    .conditions { margin-top: 8px !important; padding: 10px !important; font-size: 10px !important; }
                    .signature { margin-top: 10px !important; padding: 10px 8px 4px 8px !important; }
                    .footer-info { margin-top: 2px !important; padding-top: 2px !important; font-size: 9px !important; border-top: none !important; flex-shrink: 0 !important; flex-grow: 0 !important; }
                    .service-details, .details-section, .totals-section, .conditions, .signature, .footer-info { page-break-inside: avoid; break-inside: avoid; }
                </style>");
                html.Append($@"
    <div class='service-details'>
        <div class='service-details-title'>Detalles del Servicio</div>
        <table style='width:100%; table-layout:fixed;'>
            <tr><td style='width:80px;'><strong>Latitud:</strong></td><td>{EscapeHtml(txtLatitud.Text)}</td></tr>
            <tr><td><strong>Longitud:</strong></td><td>{EscapeHtml(txtLongitud.Text)}</td></tr>
            <tr><td><strong>Destino:</strong></td><td>{EscapeHtml(txtDestino.Text)}</td></tr>
        </table>
    </div>");
            }

            // Detalle de productos/servicios
            html.Append($@"
    <div class='details-section'>
        <div class='details-title'>Detalle de {(tipoOrden.Contains("SERVICIO") ? "Servicios" : "Productos")}</div>
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>");

            foreach (DataGridViewRow row in dataGridViewProductos.Rows)
            {
                if (!row.IsNewRow)
                {
                    html.Append("<tr>");
                    for (int i = 0; i < 7; i++)
                    {
                        string cellValue = row.Cells[i].Value?.ToString() ?? "";
                        html.Append($"<td>{EscapeHtml(cellValue)}</td>");
                    }
                    html.Append("</tr>");
                }
            }

            html.Append("</tbody></table></div>");

            // Totales
            html.Append($@"
    <div class='totals-section'>
        <table class='totals-table'>
            <tr>
                <td class='total-label'>Subtotal:</td>
                <td class='total-value'>{simboloMoneda}{(simboloMoneda == "S/" ? " " : "")}{subtotalGeneral:N2}</td>
            </tr>
            <tr>
                <td class='total-label'>IGV (18%):</td>
                <td class='total-value'>{simboloMoneda}{(simboloMoneda == "S/" ? " " : "")}{igvCalculado:N2}</td>
            </tr>
            <tr style='background-color: #e6f0fa;'>
                <td class='total-label'><strong>TOTAL GENERAL:</strong></td>
                <td class='total-value'><strong>{simboloMoneda}{(simboloMoneda == "S/" ? " " : "")}{totalGeneral:N2}</strong></td>
            </tr>
        </table>
    </div>");

            // Condiciones comerciales
            html.Append(@"
    <div class='conditions'>
        <h4>Condiciones Comerciales</h4>
        <p>
            1. Esta orden será válida una vez aceptada formalmente por el proveedor.<br>
            2. El proveedor se compromete a entregar los bienes/servicios en la fecha y lugar pactado.<br>
            3. Toda modificación de esta orden deberá ser comunicada y autorizada por el área de logística.<br>
            4. En caso de incumplimiento en plazo, calidad o cantidad, la empresa se reserva el derecho de rechazar la entrega total o parcial.<br>
            5. Los bienes deben ser entregados conforme a los requisitos establecidos en la orden, acompañados de la documentación necesaria.<br>
            6. El pago se efectuará contra la presentación de la factura y los documentos requeridos, conforme a las condiciones pactadas.<br>
            7. Los precios incluyen impuestos y cualquier otro cargo adicional, salvo acuerdo distinto por escrito.
        </p>
    </div>");

            // Firma
            html.Append(@"
    <div class='signature'>
        <div class='signature-content'>
            <p style='margin-bottom: 8px;'>Atentamente,</p>
            <div class='signature-line' style='margin: 0 auto 12px auto;'></div>
            <p style='margin: 0;'><strong>Joel Arapa Casas</strong><br>
            Coordinador de Logística<br>
            <span style='font-size: 11px; color: #003366;'>Jarapa@incavo.pe</span></p>
        </div>
    </div>");

            // Footer
            html.Append(@"
    <div class='footer-info'>
        logistica@empresa.com | Tel. (01) 234-5678 | www.empresa.com<br>
        Este documento es generado automáticamente por el sistema de gestión de órdenes
    </div>
</body>
</html>");

            return html.ToString();
        }

        private void LimpiarFormularioCompleto()
        {
            // Limpiar DataGridView
            dataGridViewProductos.Rows.Clear();
            
            // Resetear campos de entrada
            cmbCodigo.SelectedIndex = -1;
            txtDescripcion.Text = "";
            txtUMedida.Text = "";
            txtCantidad.Text = "";
            txtPrecioU.Text = "";
            txtSubTotal.Text = "";
            txtTotal.Text = "";
            
            // SOLUCIÓN PROBLEMA 1: Limpiar también el campo Proveedor, Moneda y listBox1
            cmbProveedor.SelectedIndex = -1;
            cmbMoneda.SelectedIndex = -1;
            listBox1.Items.Clear();
            
            // Resetear totales generales
            if (lblIgvValue != null)
                lblIgvValue.Text = "0.00";
            if (lblTotalValue != null)
                lblTotalValue.Text = "0.00";
            
            // Labels antiguos (para compatibilidad con código existente)
            if (label3 != null)
                label3.Text = "0.00";
            if (label4 != null)
                label4.Text = "0.00";
            
            // Limpiar campos de servicio
            txtLatitud.Text = "";
            txtLongitud.Text = "";
            txtDestino.Text = "";
            
            // Restablecer radio buttons
            rbCompra.Checked = false;
            rbServicio.Checked = false;
            
            // MEJORADO: Limpiar correlativo completamente al limpiar formulario
            txtNumero.Text = "";
        }

        /// <summary>
        /// Escapa caracteres HTML problemáticos
        /// </summary>
        private string EscapeHtml(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            return input
                .Replace("&", "&amp;")
                .Replace("<", "&lt;")
                .Replace(">", "&gt;")
                .Replace("\"", "&quot;")
                .Replace("'", "&#39;");
        }

        private void txtTotal_TextChanged(object sender, EventArgs e)
        {

        }

        private void btnInsertar_Click_1(object sender, EventArgs e)
        {
            // SOLUCIÓN PROBLEMA 2: Prevenir ejecución múltiple 
            if (btnInsertar.Text.Contains("procesando") || !btnInsertar.Enabled)
            {
                return; // Ya se está procesando, evitar duplicados
            }

            // Redirigir al método principal
            btnInsertar_Click(sender, e);
        }

        private void btnGuardar_Click_1(object sender, EventArgs e)
        {
            // SOLUCIÓN PROBLEMA 2: Implementar la funcionalidad del botón guardar
            // Prevenir ejecución múltiple con flag de procesamiento
            if (btnGuardar.Text.Contains("GUARDANDO"))
            {
                return; // Ya se está procesando, evitar duplicados
            }

            // Convertir IGV y Total a decimal antes de guardar
            string igvStr = label3.Text.Replace("S/", "").Replace("$", "").Replace(",", "").Trim();
            string totalStr = label4.Text.Replace("S/", "").Replace("$", "").Replace(",", "").Trim();
            decimal igv = 0;
            decimal total = 0;
            

            decimal.TryParse(igvStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out igv);
            decimal.TryParse(totalStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out total);

            // VALIDACIÓN: No permitir OC u OS si el total es menor a 500.00
            if ((rbCompra.Checked || rbServicio.Checked) && total < 500m)
            {
                MessageBox.Show("?? No se puede generar una Orden de Compra o Servicio con un total menor a 500.00.", "Debe ser gestionado como Ingreso Directo.", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            // Validaciones previas al guardado
            if (cmbRazon.SelectedValue == null)
            {
                MessageBox.Show("?? Debe seleccionar una empresa.", "Empresa requerida", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            if (cmbProveedor.SelectedValue == null)
            {
                MessageBox.Show("?? Debe seleccionar un proveedor.", "Proveedor requerido", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            if (cmbMoneda.SelectedValue == null)
            {
                MessageBox.Show("?? Debe seleccionar una moneda antes de guardar.", "Moneda requerida", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            if (dataGridViewProductos.Rows.Count == 0)
            {
                MessageBox.Show("?? Debe agregar al menos un producto/servicio antes de guardar.", "Sin productos", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            // Validar que todos los productos en el grid existen en la BD
            var productosInvalidos = ValidarProductosEnGrid();
            if (productosInvalidos.Count > 0)
            {
                string mensaje = "? Los siguientes códigos de producto no existen en la base de datos:\n\n";
                mensaje += string.Join("\n", productosInvalidos.Select(p => $"• {p}"));
                mensaje += "\n\nPor favor, elimine estos productos de la lista o verifique que estén registrados en el sistema.";
                
                MessageBox.Show(mensaje, "Productos no válidos", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            // Generar correlativo y obtener el id correspondiente según regla:
            // total < 500 => INGRESO DIRECTO (ID-)
            // total >= 500 y rbCompra => OC-
            // total >= 500 y rbServicio => OS-
            string correlativo = "";
            int id_ingreso = 0;
            int id_oc = 0;
            int id_os = 0;
            string tipoOrden = "";

            // Eliminado: lógica de Ingreso Directo (ID) y correlativo ID-
            if (total < 500m)
            {
                MessageBox.Show("El Ingreso Directo ahora se gestiona desde el módulo Ingreso de Materiales.", "No permitido aquí", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            else if (rbCompra.Checked)
            {
                id_oc = GetNextOrdenCompraId();
                correlativo = $"OC-{id_oc:000}";
                tipoOrden = "ORDEN DE COMPRA";
            }
            else if (rbServicio.Checked)
            {
                id_os = GetNextOrdenServicioId();
                correlativo = $"OS-{id_os:000}";
                tipoOrden = "ORDEN DE SERVICIO";
            }
            else
            {
                MessageBox.Show("?? Debe seleccionar Compra o Servicio.", "Tipo de orden requerido", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            // Comprobación de existencia del correlativo en las 3 tablas (evita UNIQUE violation)
            using (MySqlConnection connChk = ConexionDB.GetConnection())
            {
                connChk.Open();
                string sqlCheck = @"
            SELECT 
                (SELECT COUNT(*) FROM ORDEN_COMPRA WHERE correlativo = @c) +
                (SELECT COUNT(*) FROM ORDEN_SERVICIO WHERE correlativo = @c) +
                (SELECT COUNT(*) FROM INGRESO_DIRECTO WHERE correlativo = @c)";
                using (MySqlCommand cmdCheck = new MySqlCommand(sqlCheck, connChk))
                {
                    cmdCheck.Parameters.AddWithValue("@c", correlativo);
                    int count = Convert.ToInt32(cmdCheck.ExecuteScalar());
                    if (count > 0)
                    {
                        MessageBox.Show($"? El correlativo {correlativo} ya existe. Intente guardar nuevamente.", "Correlativo duplicado", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return;
                    }
                }
            }

            // Actualizamos el textbox para mostrar el correlativo real
            txtNumero.Text = correlativo;

            try
            {
                // Mostrar indicador de progreso
                this.Cursor = Cursors.WaitCursor;
                btnGuardar.Enabled = false;
                btnGuardar.Text = "? GUARDANDO...";

                if (correlativo.StartsWith("OC-"))
                {
                    GuardarOrdenCompra(id_oc, correlativo, igv, total);
                }
                else if (correlativo.StartsWith("OS-"))
                {
                    GuardarOrdenServicio(id_os, correlativo, igv, total);
                }

                // Mostrar mensaje de éxito
                MessageBox.Show($"? {tipoOrden} {correlativo} guardada correctamente.", 
                    "Guardado Exitoso", MessageBoxButtons.OK, MessageBoxIcon.Information);

                // **GENERAR PDF AUTOMÁTICAMENTE**
                GenerarOrdenPDF(correlativo, tipoOrden);

                // Limpiar formulario y preparar para nueva orden
                LimpiarFormularioCompleto();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"? Error al guardar: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                // Restaurar estado normal
                this.Cursor = Cursors.Default;
                btnGuardar.Enabled = true;
                btnGuardar.Text = "?? GUARDAR";
            }
        }

        /// <summary>
        /// Actualiza los totales generales del resumen financiero
        /// </summary>
        private void ActualizarTotalesGenerales()
        {
            double sumaSubtotales = 0;
            double sumaTotales = 0;
            string simboloMoneda = ObtenerSimboloMoneda();

            foreach (DataGridViewRow row in dataGridViewProductos.Rows)
            {
                // Quitar el símbolo de moneda y convertir a double
                string subtotalStr = row.Cells["Subtotal"].Value?.ToString().Replace("S/", "").Replace("$", "").Replace(",", "").Trim();
                string totalStr = row.Cells["Total"].Value?.ToString().Replace("S/", "").Replace("$", "").Replace(",", "").Trim();

                if (double.TryParse(subtotalStr, out double subtotal))
                    sumaSubtotales += subtotal;
                if (double.TryParse(totalStr, out double total))
                    sumaTotales += total;
            }

            // IGV = sumaSubtotales * 0.18
            double igv = sumaSubtotales * 0.18;

            // Actualizar tanto los labels nuevos como los antiguos para compatibilidad
            string igvFormateado = FormatearMoneda(igv, simboloMoneda);
            string totalFormateado = FormatearMoneda(sumaTotales, simboloMoneda);

            // Nuevos labels modernos
            if (lblIgvValue != null)
                lblIgvValue.Text = igvFormateado;
            if (lblTotalValue != null)
                lblTotalValue.Text = totalFormateado;

            // Labels antiguos (para compatibilidad con código existente)
            if (label3 != null)
                label3.Text = igvFormateado;
            if (label4 != null)
                label4.Text = totalFormateado;
                
            // SOLUCIÓN: Generar correlativo basado en el TOTAL GENERAL del resumen financiero
            ActualizarCorrelativoPorTotalGeneral(sumaTotales);
        }
        
        /// <summary>
        /// Actualiza el correlativo basándose en el total general del resumen financiero
        /// /// </summary>
        /// <param name="totalGeneral">Total general calculado de todos los productos</param>
        private void ActualizarCorrelativoPorTotalGeneral(double totalGeneral)
        {
            // Solo generar correlativo si hay productos en la lista y un tipo de orden seleccionado
            if (dataGridViewProductos.Rows.Count == 0 || (!rbCompra.Checked && !rbServicio.Checked))
            {
                return;
            }
            
            try
            {
                if (totalGeneral <= 500)
                {
                    int nextId = GetNextOrdenCompraId();
                    txtNumero.Text = $"OC-{nextId:000}";
                }
                else
                {
                    if (rbCompra.Checked)
                    {
                        int nextId = GetNextOrdenCompraId();
                        txtNumero.Text = $"OC-{nextId:000}";
                    }
                    else if (rbServicio.Checked)
                    {
                        int nextId = GetNextOrdenServicioId();
                        txtNumero.Text = $"OS-{nextId:000}";
                    }
                }
            }
            catch (Exception ex)
            {
                // En caso de error, mantener el correlativo actual
                System.Diagnostics.Debug.WriteLine($"Error al generar correlativo: {ex.Message}");
            }
        }
        
        private List<string> ValidarProductosEnGrid()
        {
            List<string> productosInvalidos = new List<string>();

            foreach (DataGridViewRow row in dataGridViewProductos.Rows)
            {
                if (!row.IsNewRow)
                {
                    string codigoProducto = row.Cells["Codigo"].Value?.ToString() ?? "";
                    if (!ValidarProductoExiste(codigoProducto))
                    {
                        productosInvalidos.Add(codigoProducto);
                    }
                }
            }

            return productosInvalidos;
        }

        private void GuardarOrdenCompra(int id_oc, string correlativo, decimal igv, decimal total)
        {
            using (MySqlConnection conn = ConexionDB.GetConnection())
            {
                conn.Open();
                MySqlTransaction transaction = conn.BeginTransaction();
                try
                {
                    MySqlCommand cmd = new MySqlCommand(@"
                INSERT INTO ORDEN_COMPRA (id_oc, correlativo, id_empresa, id_proveedor, id_forma_pago, id_moneda, fecha_oc, fecha_requerida, igv, total_general, estado, usuario_creacion, fecha_creacion)
                VALUES (@id_oc, @correlativo, @id_empresa, @id_proveedor, @id_forma_pago, @id_moneda, @fecha_oc, @fecha_requerida, @igv, @total_general, @estado, @usuario_creacion, @fecha_creacion)", conn, transaction);

                    cmd.Parameters.AddWithValue("@id_oc", id_oc);
                    cmd.Parameters.AddWithValue("@correlativo", correlativo);
                    cmd.Parameters.AddWithValue("@id_empresa", cmbRazon.SelectedValue);
                    cmd.Parameters.AddWithValue("@id_proveedor", cmbProveedor.SelectedValue);
                    cmd.Parameters.AddWithValue("@id_forma_pago", DBNull.Value);
                    cmd.Parameters.AddWithValue("@id_moneda", cmbMoneda.SelectedValue);
                    cmd.Parameters.AddWithValue("@fecha_oc", dtpFecha.Value);
                    cmd.Parameters.AddWithValue("@fecha_requerida", dtpFechaReq.Value);
                    cmd.Parameters.AddWithValue("@igv", igv);
                    cmd.Parameters.AddWithValue("@total_general", total);
                    cmd.Parameters.AddWithValue("@estado", "PENDIENTE");
                    cmd.Parameters.AddWithValue("@usuario_creacion", Environment.UserName);
                    cmd.Parameters.AddWithValue("@fecha_creacion", DateTime.Now);
                    cmd.ExecuteNonQuery();

                    // Insertar detalles en DETALLE_OC
                    foreach (DataGridViewRow row in dataGridViewProductos.Rows)
                    {
                        if (!row.IsNewRow)
                        {
                            MySqlCommand cmdDetalle = new MySqlCommand(@"INSERT INTO DETALLE_OC (id_oc, codigo_producto, cantidad, precio_unitario, subtotal, total) VALUES (@id_oc, @codigo_producto, @cantidad, @precio_unitario, @subtotal, @total)", conn, transaction);
                            cmdDetalle.Parameters.AddWithValue("@id_oc", id_oc);
                            cmdDetalle.Parameters.AddWithValue("@codigo_producto", row.Cells["Codigo"].Value ?? "");
                            cmdDetalle.Parameters.AddWithValue("@cantidad", row.Cells["Cantidad"].Value ?? 0);
                            cmdDetalle.Parameters.AddWithValue("@precio_unitario", LimpiarValorMoneda(row.Cells["PrecioUnitario"].Value?.ToString()));
                            cmdDetalle.Parameters.AddWithValue("@subtotal", LimpiarValorMoneda(row.Cells["Subtotal"].Value?.ToString()));
                            cmdDetalle.Parameters.AddWithValue("@total", LimpiarValorMoneda(row.Cells["Total"].Value?.ToString()));
                            cmdDetalle.ExecuteNonQuery();
                        }
                    }

                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    throw new Exception($"Error al guardar Orden de Compra: {ex.Message}");
                }
            }
        }

        private void GuardarOrdenServicio(int id_os, string correlativo, decimal igv, decimal total)
        {
            using (MySqlConnection conn = ConexionDB.GetConnection())
            {
                conn.Open();
                MySqlTransaction transaction = conn.BeginTransaction();
                try
                {
                    MySqlCommand cmd = new MySqlCommand(@"
                INSERT INTO ORDEN_SERVICIO (id_os, correlativo, id_empresa, id_proveedor, id_forma_pago, id_moneda, contacto, celular, correo, latitud, longitud, destino, fecha_servicio, fecha_requerida, igv, total_general, estado, usuario_creacion, fecha_creacion)
                VALUES (@id_os, @correlativo, @id_empresa, @id_proveedor, @id_forma_pago, @id_moneda, @contacto, @celular, @correo, @latitud, @longitud, @destino, @fecha_servicio, @fecha_requerida, @igv, @total_general, @estado, @usuario_creacion, @fecha_creacion)", conn, transaction);

                    cmd.Parameters.AddWithValue("@id_os", id_os);
                    cmd.Parameters.AddWithValue("@correlativo", correlativo);
                    cmd.Parameters.AddWithValue("@id_empresa", cmbRazon.SelectedValue);
                    cmd.Parameters.AddWithValue("@id_proveedor", cmbProveedor.SelectedValue);
                    cmd.Parameters.AddWithValue("@id_forma_pago", DBNull.Value);
                    cmd.Parameters.AddWithValue("@id_moneda", cmbMoneda.SelectedValue);
                    cmd.Parameters.AddWithValue("@contacto", "");
                    cmd.Parameters.AddWithValue("@celular", "");
                    cmd.Parameters.AddWithValue("@correo", "");
                    cmd.Parameters.AddWithValue("@latitud", txtLatitud.Text);
                    cmd.Parameters.AddWithValue("@longitud", txtLongitud.Text);
                    cmd.Parameters.AddWithValue("@destino", txtDestino.Text);
                    cmd.Parameters.AddWithValue("@fecha_servicio", dtpFecha.Value);
                    cmd.Parameters.AddWithValue("@fecha_requerida", dtpFechaReq.Value);
                    cmd.Parameters.AddWithValue("@igv", igv);
                    cmd.Parameters.AddWithValue("@total_general", total);
                    cmd.Parameters.AddWithValue("@estado", "PENDIENTE");
                    cmd.Parameters.AddWithValue("@usuario_creacion", Environment.UserName);
                    cmd.Parameters.AddWithValue("@fecha_creacion", DateTime.Now);
                    cmd.ExecuteNonQuery();

                    // Insertar detalles en DETALLE_OS
                    foreach (DataGridViewRow row in dataGridViewProductos.Rows)
                    {
                        if (!row.IsNewRow)
                        {
                            MySqlCommand cmdDetalle = new MySqlCommand(@"INSERT INTO DETALLE_OS (id_os, codigo_servicio, descripcion, cantidad, unidad, precio_unitario, subtotal, total) VALUES (@id_os, @codigo_servicio, @descripcion, @cantidad, @unidad, @precio_unitario, @subtotal, @total)", conn, transaction);
                            cmdDetalle.Parameters.AddWithValue("@id_os", id_os);
                            cmdDetalle.Parameters.AddWithValue("@codigo_servicio", row.Cells["Codigo"].Value ?? "");
                            cmdDetalle.Parameters.AddWithValue("@descripcion", row.Cells["Descripcion"].Value ?? "");
                            cmdDetalle.Parameters.AddWithValue("@cantidad", row.Cells["Cantidad"].Value ?? 0);
                            cmdDetalle.Parameters.AddWithValue("@unidad", row.Cells["Unidad"].Value ?? "");
                            cmdDetalle.Parameters.AddWithValue("@precio_unitario", LimpiarValorMoneda(row.Cells["PrecioUnitario"].Value?.ToString()));
                            cmdDetalle.Parameters.AddWithValue("@subtotal", LimpiarValorMoneda(row.Cells["Subtotal"].Value?.ToString()));
                            cmdDetalle.Parameters.AddWithValue("@total", LimpiarValorMoneda(row.Cells["Total"].Value?.ToString()));
                            cmdDetalle.ExecuteNonQuery();
                        }
                    }

                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    throw new Exception($"Error al guardar Orden de Servicio: {ex.Message}");
                }
            }
        }

        private string LimpiarValorMoneda(string valor)
        {
            if (string.IsNullOrEmpty(valor))
                return "0";

            return valor.Replace("S/", "").Replace("$", "").Replace(",", "").Trim();
        }

        // Métodos stub para eventos del Designer que faltan
        private void lblTitulo_Click(object sender, EventArgs e) { }
        private void txtNumero_TextChanged(object sender, EventArgs e) { }
        private void cmbMoneda_SelectedIndexChanged(object sender, EventArgs e) 
        {
            // Recalcular totales cuando cambie la moneda
            CalcularTotales();
            ActualizarTotalesGenerales();
        }
        private void txtDescripcion_TextChanged(object sender, EventArgs e) { }
        private void Ordenes_de_Compra_Load(object sender, EventArgs e) { }
    }
}
