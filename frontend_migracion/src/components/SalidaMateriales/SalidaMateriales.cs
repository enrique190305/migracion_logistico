using System;
using System.Collections.Generic;
using System.Data;
using MySql.Data.MySqlClient;
using System.IO;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace GenracionOC
{
    public partial class Salida_De_Materiales : Form
    {
        private bool cargando = true;
        private DataTable materialDetalle;

        public Salida_De_Materiales()
        {
            InitializeComponent();
            // Attach responsive helper to enable dynamic scaling
            ResponsiveHelper.Attach(this);

            // Apply centralized modern design
            InitializeModernDesign();
            cargando = true;
            InitializeMaterialDetalle();
            CargarProyectos();
            CargarTrabajadores();
            GenerarNumeroSalida();
            comboBoxTrabajador.DropDownStyle = ComboBoxStyle.DropDownList;
            comboBoxCodigo.DropDownStyle = ComboBoxStyle.DropDownList;
            comboBoxProyecto.DropDownStyle = ComboBoxStyle.DropDownList;
            txtDni.Enabled = false; txtArea.Enabled = false; textBoxDescripcion.Enabled = false; textBoxUnidad.Enabled = false; textBoxNSalida.Enabled = false; txtStock.Enabled = false;
            comboBoxCodigo.DataSource = null; comboBoxCodigo.Items.Clear();
            cargando = false;
        }

        private void InitializeMaterialDetalle()
        {
            materialDetalle = new DataTable();
            materialDetalle.Columns.Add("Codigo", typeof(string));
            materialDetalle.Columns.Add("Descripcion", typeof(string));
            materialDetalle.Columns.Add("Cantidad", typeof(int));
            materialDetalle.Columns.Add("Unidad", typeof(string));
            materialDetalle.Columns.Add("Observacion", typeof(string));
        }

        private void InitializeModernDesign()
        {
            UIHelpers.ApplyModernDesign(this);
        }

        private void SetupModernForm()
        {
            this.BackColor = Color.FromArgb(248, 249, 250);
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular);
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
        }

        private void SetupModernButtons()
        {
            Button[] buttons = { buttonInsertar, buttonBorrar, buttonGenerarPDF, btnPrestamo };
            foreach (var btn in buttons)
            {
                btn.FlatStyle = FlatStyle.Flat;
                btn.FlatAppearance.BorderSize = 1;
                btn.FlatAppearance.BorderColor = DarkenColor(btn.BackColor, 0.2f);
                btn.UseVisualStyleBackColor = false;
                btn.Cursor = Cursors.Hand;
                btn.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
                btn.MouseEnter += (s, e) => { var b = (Button)s; var c = GetButtonOriginalColor(b); b.BackColor = LightenColor(c, 0.1f); b.FlatAppearance.BorderColor = DarkenColor(c, 0.3f); };
                btn.MouseLeave += (s, e) => { RestoreButtonOriginalColor((Button)s); };
                btn.MouseDown += (s, e) => { var b = (Button)s; b.BackColor = DarkenColor(GetButtonOriginalColor(b), 0.1f); };
                btn.MouseUp += (s, e) => { var b = (Button)s; b.BackColor = LightenColor(GetButtonOriginalColor(b), 0.1f); };
            }
        }

        private void SetupModernDataGridView()
        {
            dataGridViewDetalle.EnableHeadersVisualStyles = false;
            dataGridViewDetalle.ColumnHeadersDefaultCellStyle.BackColor = Color.FromArgb(52, 73, 94);
            dataGridViewDetalle.ColumnHeadersDefaultCellStyle.ForeColor = Color.White;
            dataGridViewDetalle.ColumnHeadersDefaultCellStyle.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            dataGridViewDetalle.ColumnHeadersDefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleCenter;
            dataGridViewDetalle.ColumnHeadersHeight = 35;
            dataGridViewDetalle.AlternatingRowsDefaultCellStyle.BackColor = Color.FromArgb(248, 249, 250);
            dataGridViewDetalle.DefaultCellStyle.BackColor = Color.White;
            dataGridViewDetalle.DefaultCellStyle.SelectionBackColor = Color.FromArgb(52, 152, 219);
            dataGridViewDetalle.DefaultCellStyle.SelectionForeColor = Color.White;
            dataGridViewDetalle.DefaultCellStyle.Font = new Font("Segoe UI", 9F);
            dataGridViewDetalle.RowTemplate.Height = 30;
            dataGridViewDetalle.GridColor = Color.FromArgb(221, 221, 221);
            dataGridViewDetalle.CellBorderStyle = DataGridViewCellBorderStyle.SingleHorizontal;
            dataGridViewDetalle.BorderStyle = BorderStyle.None;
            dataGridViewDetalle.MultiSelect = false;
            dataGridViewDetalle.AllowUserToResizeRows = false;
            dataGridViewDetalle.AllowUserToAddRows = false;
            dataGridViewDetalle.ReadOnly = true;
        }

        private void SetupHoverEffects()
        {
            ComboBox[] comboBoxes = { comboBoxProyecto, comboBoxTrabajador, comboBoxCodigo };
            foreach (var cmb in comboBoxes)
            {
                cmb.MouseEnter += (s, e) => ((ComboBox)s).BackColor = Color.FromArgb(240, 242, 247);
                cmb.MouseLeave += (s, e) => ((ComboBox)s).BackColor = Color.White;
            }
            TextBox[] textBoxes = { textBoxCantidad, textBoxObservacion };
            foreach (var txt in textBoxes)
            {
                txt.Enter += (s, e) => ((TextBox)s).BackColor = Color.FromArgb(245, 248, 250);
                txt.Leave += (s, e) => ((TextBox)s).BackColor = Color.White;
            }
        }

        private Color LightenColor(Color color, float factor) => Color.FromArgb(
            Math.Min(255, (int)(color.R + (255 - color.R) * factor)),
            Math.Min(255, (int)(color.G + (255 - color.G) * factor)),
            Math.Min(255, (int)(color.B + (255 - color.B) * factor)));
        private Color DarkenColor(Color color, float factor) => Color.FromArgb(
            Math.Max(0, (int)(color.R * (1 - factor))),
            Math.Max(0, (int)(color.G * (1 - factor))),
            Math.Max(0, (int)(color.B * (1 - factor))));
        private Color GetButtonOriginalColor(Button button)
        {
            if (button == buttonInsertar) return Color.FromArgb(41, 128, 185);
            if (button == buttonBorrar) return Color.FromArgb(231, 76, 60);
            if (button == buttonGenerarPDF) return Color.FromArgb(39, 174, 96);
            if (button == btnPrestamo) return Color.FromArgb(155, 89, 182);
            return button.BackColor;
        }
        private void RestoreButtonOriginalColor(Button button)
        { button.BackColor = GetButtonOriginalColor(button); button.FlatAppearance.BorderColor = DarkenColor(GetButtonOriginalColor(button), 0.2f); }

        private void CargarProyectos()
        {
            using (MySqlConnection con = ConexionDB.GetConnection())
            {
                con.Open();
                MySqlDataAdapter da = new MySqlDataAdapter("SELECT id_proyecto, nombre_proyecto FROM PROYECTO_ALMACEN", con);
                DataTable dt = new DataTable();
                da.Fill(dt);

                DataRow filaVacia = dt.NewRow();
                filaVacia["id_proyecto"] = DBNull.Value;
                filaVacia["nombre_proyecto"] = "Seleccione un proyecto";
                dt.Rows.InsertAt(filaVacia, 0);

                comboBoxProyecto.DataSource = dt;
                comboBoxProyecto.DisplayMember = "nombre_proyecto";
                comboBoxProyecto.ValueMember = "id_proyecto";
                comboBoxProyecto.SelectedIndex = 0;
            }
        }

        private void CargarTrabajadores()
        {
            using (MySqlConnection con = ConexionDB.GetConnection())
            {
                con.Open();
                MySqlDataAdapter da = new MySqlDataAdapter("SELECT id_personal, nom_ape FROM PERSONAL", con);
                DataTable dt = new DataTable();
                da.Fill(dt);

                DataRow filaVacia = dt.NewRow();
                filaVacia["id_personal"] = DBNull.Value;
                filaVacia["nom_ape"] = "Seleccione un trabajador";
                dt.Rows.InsertAt(filaVacia, 0);

                comboBoxTrabajador.DataSource = dt;
                comboBoxTrabajador.DisplayMember = "nom_ape";
                comboBoxTrabajador.ValueMember = "id_personal";
                comboBoxTrabajador.SelectedIndex = 0;
            }
        }

        private void CargarProductosPorProyecto(string nombreProyecto)
        {
            comboBoxCodigo.DataSource = null;
            comboBoxCodigo.Items.Clear();
            textBoxDescripcion.Text = "";
            textBoxUnidad.Text = "";
            txtStock.Text = "";

            if (string.IsNullOrWhiteSpace(nombreProyecto) || nombreProyecto == "Seleccione un proyecto")
            {
                return;
            }

            using (MySqlConnection conn = ConexionDB.GetConnection())
            {
                conn.Open();
                // MODIFICACIÓN: Cambiar la consulta para mostrar descripción como DisplayMember
                string query = @"
                    SELECT mk.codigo_producto, mk.descripcion, mk.unidad,
                           SUM(CASE WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad ELSE -mk.cantidad END) AS stock_actual
                    FROM MOVIMIENTO_KARDEX mk
                    WHERE RTRIM(LTRIM(mk.proyecto)) = @proyecto
                    GROUP BY mk.codigo_producto, mk.descripcion, mk.unidad
                    HAVING SUM(CASE WHEN mk.tipo_movimiento = 'INGRESO' THEN mk.cantidad ELSE -mk.cantidad END) > 0
                    ORDER BY mk.descripcion"; // CAMBIO: Ordenar por descripción

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@proyecto", nombreProyecto.Trim());
                    MySqlDataAdapter da = new MySqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    if (dt.Rows.Count == 0)
                    {
                        MessageBox.Show($" El proyecto '{nombreProyecto}' no tiene productos almacenados con stock disponible.\n\nVerifique:\n• Que el proyecto tenga ingresos registrados\n• Que los nombres coincidan exactamente\n• Que haya stock disponible", 
                            "Sin productos disponibles", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        
                        DataRow emptyRow = dt.NewRow();
                        emptyRow["codigo_producto"] = "Sin productos disponibles";
                        emptyRow["descripcion"] = "";
                        emptyRow["unidad"] = "";
                        emptyRow["stock_actual"] = 0;
                        dt.Rows.Add(emptyRow);
                    }

                    comboBoxCodigo.DataSource = dt;
                    comboBoxCodigo.DisplayMember = "descripcion"; // CAMBIO: Mostrar descripción en lugar de código
                    comboBoxCodigo.ValueMember = "descripcion";   // CAMBIO: Usar descripción como valor
                    comboBoxCodigo.SelectedIndex = -1;
                }
            }
        }

        private void comboBoxProyecto_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (cargando || comboBoxProyecto.SelectedIndex <= 0) 
            {
                comboBoxCodigo.DataSource = null;
                comboBoxCodigo.Items.Clear();
                textBoxDescripcion.Text = "";
                textBoxUnidad.Text = "";
                txtStock.Text = "";
                return;
            }

            string nombreProyecto = comboBoxProyecto.Text;
            CargarProductosPorProyecto(nombreProyecto);
        }

        private void GenerarNumeroSalida()
        {
            try
            {
                using (MySqlConnection con = ConexionDB.GetConnection())
                {
                    con.Open();
                    MySqlCommand cmd = new MySqlCommand("SELECT IFNULL(MAX(CAST(SUBSTR(numero_salida, 4, LENGTH(numero_salida) - 3) AS SIGNED)), 0) + 1 FROM SALIDAS_MATERIALES", con);
                    
                    // CORRECCIÓN: Convertir de Int64 a Int32 de forma segura
                    object result = cmd.ExecuteScalar();
                    int siguienteNumero = 1; // Valor por defecto
                    
                    if (result != null && result != DBNull.Value)
                    {
                        // Convertir de forma segura Int64 a Int32
                        if (result is long longValue)
                        {
                            siguienteNumero = (int)Math.Min(longValue, int.MaxValue);
                        }
                        else if (result is int intValue)
                        {
                            siguienteNumero = intValue;
                        }
                        else
                        {
                            int.TryParse(result.ToString(), out siguienteNumero);
                        }
                    }
                    
                    textBoxNSalida.Text = "NS-" + siguienteNumero.ToString("D3");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error al generar número de salida: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                textBoxNSalida.Text = "NS-001"; // Valor por defecto en caso de error
            }
        }

        private void comboBoxTrabajador_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (cargando || comboBoxTrabajador.SelectedIndex <= 0)
            {
                txtArea.Text = "";
                txtDni.Text = "";
                Firma.Image = null;
                Firma.Visible = false;
                return;
            }

            // CORRECCIÓN: Manejo seguro del SelectedValue que puede ser Int64
            object selectedValue = comboBoxTrabajador.SelectedValue;
            int idTrabajador = 0;
            
            if (selectedValue != null && selectedValue != DBNull.Value)
            {
                if (selectedValue is long longValue)
                {
                    idTrabajador = (int)Math.Min(longValue, int.MaxValue);
                }
                else if (selectedValue is int intValue)
                {
                    idTrabajador = intValue;
                }
                else
                {
                    int.TryParse(selectedValue.ToString(), out idTrabajador);
                }
            }

            if (idTrabajador > 0)
            {
                using (MySqlConnection con = ConexionDB.GetConnection())
                {
                    con.Open();
                    MySqlCommand cmd = new MySqlCommand(@"
                SELECT A.nombre, P.dni, P.firma
                FROM PERSONAL P
                INNER JOIN AREA A ON P.id_area = A.id_area
                WHERE P.id_personal = @id", con);

                    cmd.Parameters.AddWithValue("@id", idTrabajador);

                    MySqlDataReader reader = cmd.ExecuteReader();
                    if (reader.Read())
                    {
                        txtArea.Text = reader["nombre"].ToString();
                        txtDni.Text = reader["dni"].ToString();

                        if (reader["firma"] != DBNull.Value)
                        {
                            byte[] firmaBytes = (byte[])reader["firma"];
                            using (MemoryStream ms = new MemoryStream(firmaBytes))
                            {
                                Firma.Image = Image.FromStream(ms);
                                Firma.Visible = true;
                            }
                        }
                        else
                        {
                            Firma.Image = null;
                            Firma.Visible = false;
                        }
                    }
                    else
                    {
                        txtArea.Text = "";
                        txtDni.Text = "";
                        Firma.Image = null;
                        Firma.Visible = false;
                    }
                }
            }
        }

        private void comboBoxCodigo_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (cargando || comboBoxCodigo.SelectedItem == null)
            {
                textBoxDescripcion.Text = "";
                textBoxUnidad.Text = "";
                txtStock.Text = "";
                return;
            }

            if (comboBoxCodigo.SelectedItem is DataRowView selectedRow)
            {
                // MODIFICACIÓN: Buscar por descripción seleccionada y autocompletar código y unidad
                string descripcionProducto = comboBoxCodigo.SelectedValue?.ToString();
                
                if (descripcionProducto == "Sin productos disponibles")
                {
                    textBoxDescripcion.Text = "";
                    textBoxUnidad.Text = "";
                    txtStock.Text = "";
                    return;
                }

                // Obtener código basándose en la descripción seleccionada
                string codigoProducto = selectedRow["codigo_producto"]?.ToString();
                
                // CAMBIO: Mostrar código en textBoxDescripcion en lugar de descripción
                textBoxDescripcion.Text = codigoProducto ?? string.Empty; // Mostrar código del producto
                textBoxUnidad.Text = selectedRow["unidad"] != DBNull.Value ? selectedRow["unidad"].ToString() : string.Empty;
                
                // Update stock preview with real-time calculation
                if (!string.IsNullOrEmpty(codigoProducto))
                {
                    ActualizarStockPrevisualizacion(codigoProducto);
                }
            }
            else
            {
                textBoxDescripcion.Text = string.Empty; // Limpiar código
                textBoxUnidad.Text = string.Empty;
                txtStock.Text = string.Empty;
            }
        }

        private void ActualizarStockPrevisualizacion(string codigoProducto)
        {
            string nombreProyecto = comboBoxProyecto.Text;
            
            if (string.IsNullOrWhiteSpace(nombreProyecto) || nombreProyecto == "Seleccione un proyecto")
            {
                txtStock.Text = "0";
                return;
            }

            decimal stockReal = 0;
            
            using (MySqlConnection conn = ConexionDB.GetConnection())
            {
                conn.Open();
                string query = @"
                    SELECT SUM(CASE WHEN tipo_movimiento = 'INGRESO' THEN cantidad ELSE -cantidad END) AS stock
                    FROM MOVIMIENTO_KARDEX
                    WHERE codigo_producto = @codigo AND RTRIM(LTRIM(proyecto)) = @proyecto";
                    
                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@codigo", codigoProducto);
                    cmd.Parameters.AddWithValue("@proyecto", nombreProyecto.Trim());
                    object result = cmd.ExecuteScalar();
                    stockReal = result != null && result != DBNull.Value ? Convert.ToDecimal(result) : 0;
                }
            }

            decimal cantidadEnGrid = 0;
            foreach (DataGridViewRow row in dataGridViewDetalle.Rows)
            {
                if (!row.IsNewRow && row.Cells["Codigo"].Value?.ToString() == codigoProducto)
                {
                    if (int.TryParse(row.Cells["Cantidad"].Value?.ToString(), out int cantidad))
                    {
                        cantidadEnGrid += cantidad;
                    }
                }
            }

            decimal stockPrevisualizado = stockReal - cantidadEnGrid;
            txtStock.Text = stockPrevisualizado.ToString();
            
            if (stockPrevisualizado <= 0)
            {
                txtStock.ForeColor = Color.FromArgb(231, 76, 60); // Red
                txtStock.Font = new Font(txtStock.Font, FontStyle.Bold);
            }
            else if (stockPrevisualizado <= 5)
            {
                txtStock.ForeColor = Color.FromArgb(243, 156, 18); // Orange
                txtStock.Font = new Font(txtStock.Font, FontStyle.Bold);
            }
            else
            {
                txtStock.ForeColor = Color.FromArgb(39, 174, 96); // Green
                txtStock.Font = new Font(txtStock.Font, FontStyle.Bold);
            }
        }

        private void buttonInsertar_Click(object sender, EventArgs e)
        {
            // Validaciones iniciales
            if (comboBoxProyecto.SelectedIndex <= 0) { MessageBox.Show("Seleccione un proyecto válido."); return; }
            if (comboBoxCodigo.SelectedIndex < 0 || string.IsNullOrEmpty(comboBoxCodigo.Text) || comboBoxCodigo.Text == "Sin productos disponibles") { MessageBox.Show("?? Seleccione una descripción de producto válida."); return; }
            if (!int.TryParse(textBoxCantidad.Text, out int cantidad) || cantidad <= 0) { MessageBox.Show("? Cantidad inválida."); return; }
            if (!decimal.TryParse(txtStock.Text, out decimal stockDisp)) { MessageBox.Show("?? Stock no disponible."); return; }
            if (cantidad > stockDisp) { MessageBox.Show(" La cantidad solicitada excede el stock disponible."); return; }

            // MODIFICACIÓN: Obtener código y descripción según nueva estructura
            string codigo = textBoxDescripcion.Text;      // El código ahora está en textBoxDescripcion
            string descripcion = comboBoxCodigo.Text;     // La descripción ahora está en comboBoxCodigo
            string unidad = textBoxUnidad.Text;
            string observacion = textBoxObservacion.Text;

            // Agregar al DataGridView
            dataGridViewDetalle.Rows.Add(codigo, descripcion, cantidad, unidad, observacion);
            
            // Actualizar stock previsualizado
            ActualizarStockPrevisualizacion(codigo);
            
            // Limpiar campos para próxima entrada
            comboBoxCodigo.SelectedIndex = -1; 
            textBoxDescripcion.Clear(); 
            textBoxUnidad.Clear(); 
            textBoxCantidad.Clear(); 
            textBoxObservacion.Clear(); 
            txtStock.Text = ""; 
            comboBoxCodigo.Focus();

            // Mensaje de confirmación
            decimal stockRestante = stockDisp - cantidad;
            MessageBox.Show($"Material agregado correctamente\n\n" +
                           $"Producto: {codigo} - {descripcion}\n" +
                           $"Cantidad: {cantidad} {unidad}\n" +
                           $"Stock restante: {stockRestante} {unidad}",
                           "Material agregado", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void buttonBorrar_Click(object sender, EventArgs e)
        {
            if (dataGridViewDetalle.SelectedRows.Count > 0)
            {
                DialogResult confirm = MessageBox.Show("¿Está seguro de que desea eliminar la(s) fila(s) seleccionada(s)?", "Confirmar Eliminación", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                if (confirm == DialogResult.Yes)
                {
                    // **CORRECCIÓN: Actualización mejorada del borrado con previsualización de stock**
                    List<DataGridViewRow> rowsToDelete = new List<DataGridViewRow>();
                    string ultimoCodigoEliminado = "";
                    string ultimaDescripcionEliminada = "";
                    
                    foreach (DataGridViewRow row in dataGridViewDetalle.SelectedRows)
                    {
                        if (!row.IsNewRow)
                        {
                            // Guardar tanto el código como la descripción del producto eliminado
                            ultimoCodigoEliminado = row.Cells["Codigo"].Value?.ToString() ?? "";
                            ultimaDescripcionEliminada = row.Cells["Descripcion"].Value?.ToString() ?? "";
                            rowsToDelete.Add(row);
                        }
                    }
                    
                    // Eliminar las filas seleccionadas
                    foreach (DataGridViewRow row in rowsToDelete) 
                    {
                        dataGridViewDetalle.Rows.Remove(row);
                    }
                    
                    // **CORRECCIÓN: Verificar si el producto seleccionado actualmente coincide con el eliminado**
                    // Comparar por descripción (comboBoxCodigo.Text) o por código (textBoxDescripcion.Text)
                    bool esProductoSeleccionado = false;
                    
                    if (!string.IsNullOrEmpty(ultimoCodigoEliminado) && !string.IsNullOrEmpty(ultimaDescripcionEliminada))
                    {
                        // Verificar si el producto actualmente seleccionado es el mismo que se eliminó
                        string descripcionActual = comboBoxCodigo.Text;
                        string codigoActual = textBoxDescripcion.Text;
                        
                        esProductoSeleccionado = (descripcionActual == ultimaDescripcionEliminada) || 
                                       (codigoActual == ultimoCodigoEliminado);
                    }
                    
                    // **ACTUALIZAR PREVISUALIZACIÓN DE STOCK DESPUÉS DE ELIMINAR**
                    if (esProductoSeleccionado)
                    {
                        ActualizarStockPrevisualizacion(ultimoCodigoEliminado);
                    }
                    
                    MessageBox.Show("? Fila(s) eliminada(s) del detalle.\n\n?? La previsualización de stock ha sido actualizada.", "Eliminación Exitosa", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            else
            {
                MessageBox.Show("?? Seleccione al menos una fila para borrar.", "Advertencia", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void buttonGenerarPDF_Click(object sender, EventArgs e)
        {
            if (comboBoxProyecto.SelectedIndex <= 0 || comboBoxTrabajador.SelectedIndex <= 0) { MessageBox.Show("Seleccione proyecto y trabajador válidos."); return; }
            if (dataGridViewDetalle.Rows.Count == 0) { MessageBox.Show("No hay materiales para procesar."); return; }

            // 1. Guardar en BD (cabecera, detalle y kardex)
            if (!GuardarSalidaEnBaseDatos())
            {
                // Si falla, no generamos PDF
                return;
            }

            // 2. Generar PDF si guardado correcto
            string numeroSalida = textBoxNSalida.Text;
            string proyectoNombre = comboBoxProyecto.Text;
            string trabajadorNombre = comboBoxTrabajador.Text;
            string trabajadorDni = txtDni.Text;
            string trabajadorArea = txtArea.Text;
            byte[] firmaBytes = null;
            if (Firma.Image != null)
            {
                using MemoryStream ms = new MemoryStream();
                try { Firma.Image.Save(ms, System.Drawing.Imaging.ImageFormat.Png); firmaBytes = ms.ToArray(); }
                catch { firmaBytes = null; }
            }
            GenerarPDFSalidaConDatos(numeroSalida, proyectoNombre, trabajadorNombre, trabajadorDni, trabajadorArea, firmaBytes);

            // 3. Preparar siguiente salida
            LimpiarFormulario();
            GenerarNumeroSalida();
        }

        /// <summary>
        /// Guarda la salida de materiales en SALIDAS_MATERIALES, DETALLE_SALIDA y MOVIMIENTO_KARDEX.
        /// </summary>
        private bool GuardarSalidaEnBaseDatos()
        {
            string numeroSalida = textBoxNSalida.Text?.Trim();
            if (string.IsNullOrWhiteSpace(numeroSalida)) { MessageBox.Show("Número de salida inválido."); return false; }
            
            // CORRECCIÓN: Manejo seguro del SelectedValue que puede ser Int64
            object selectedValue = comboBoxTrabajador.SelectedValue;
            int idPersonal = 0;
            
            if (selectedValue != null && selectedValue != DBNull.Value)
            {
                if (selectedValue is long longValue)
                {
                    idPersonal = (int)Math.Min(longValue, int.MaxValue);
                }
                else if (selectedValue is int intValue)
                {
                    idPersonal = intValue;
                }
                else
                {
                    int.TryParse(selectedValue.ToString(), out idPersonal);
                }
            }
            
            if (idPersonal <= 0) 
            { 
                MessageBox.Show("Trabajador inválido."); 
                return false; 
            }
            
            string proyecto = comboBoxProyecto.Text.Trim();
            string trabajadorNombre = comboBoxTrabajador.Text.Trim();
            string area = txtArea.Text.Trim();
            string dni = txtDni.Text.Trim();
            DateTime fechaRegistro = DateTime.Now; // Si luego se agrega un DateTimePicker se reemplaza aquí

            try
            {
                using (MySqlConnection conn = ConexionDB.GetConnection())
                {
                    conn.Open();
                    using (MySqlTransaction tx = conn.BeginTransaction())
                    {
                        // Verificar duplicado - CORRECCIÓN: Manejo seguro de COUNT
                        using (MySqlCommand cmdDup = new MySqlCommand("SELECT COUNT(1) FROM SALIDAS_MATERIALES WHERE numero_salida = @n", conn, tx))
                        {
                            cmdDup.Parameters.AddWithValue("@n", numeroSalida);
                            object countResult = cmdDup.ExecuteScalar();
                            int count = 0;
                            
                            if (countResult != null && countResult != DBNull.Value)
                            {
                                if (countResult is long longCount)
                                {
                                    count = (int)Math.Min(longCount, int.MaxValue);
                                }
                                else if (countResult is int intCount)
                                {
                                    count = intCount;
                                }
                                else
                                {
                                    int.TryParse(countResult.ToString(), out count);
                                }
                            }
                            
                            if (count > 0)
                            {
                                MessageBox.Show("El número de salida ya existe. Genere nuevamente.");
                                tx.Rollback();
                                return false;
                            }
                        }

                        // Insert cabecera
                        using (MySqlCommand cmdCab = new MySqlCommand(@"INSERT INTO SALIDAS_MATERIALES (numero_salida, fecha_registro, proyecto, id_personal, nom_ape, area, dni) 
VALUES (@numero_salida, @fecha_registro, @proyecto, @id_personal, @nom_ape, @area, @dni)", conn, tx))
                        {
                            cmdCab.Parameters.AddWithValue("@numero_salida", numeroSalida);
                            cmdCab.Parameters.AddWithValue("@fecha_registro", fechaRegistro);
                            cmdCab.Parameters.AddWithValue("@proyecto", proyecto);
                            cmdCab.Parameters.AddWithValue("@id_personal", idPersonal);
                            cmdCab.Parameters.AddWithValue("@nom_ape", trabajadorNombre);
                            cmdCab.Parameters.AddWithValue("@area", area);
                            cmdCab.Parameters.AddWithValue("@dni", dni);
                            cmdCab.ExecuteNonQuery();
                        }

                        // Insert detalle + kardex
                        foreach (DataGridViewRow row in dataGridViewDetalle.Rows)
                        {
                            if (row.IsNewRow) continue;
                            string codigo = row.Cells["Codigo"].Value?.ToString();
                            string descripcion = row.Cells["Descripcion"].Value?.ToString();
                            string unidad = row.Cells["Unidad"].Value?.ToString();
                            string obs = row.Cells["Observacion"].Value?.ToString() ?? string.Empty;
                            if (!int.TryParse(row.Cells["Cantidad"].Value?.ToString(), out int cantidad) || cantidad <= 0)
                            {
                                tx.Rollback();
                                MessageBox.Show($"Cantidad inválida para el producto {codigo}.");
                                return false;
                            }

                            using (MySqlCommand cmdDet = new MySqlCommand(@"INSERT INTO DETALLE_SALIDA (numero_salida, codigo_producto, descripcion, cantidad, unidad_medida, observacion_general)
VALUES (@numero_salida, @codigo_producto, @descripcion, @cantidad, @unidad, @obs)", conn, tx))
                            {
                                cmdDet.Parameters.AddWithValue("@numero_salida", numeroSalida);
                                cmdDet.Parameters.AddWithValue("@codigo_producto", codigo);
                                cmdDet.Parameters.AddWithValue("@descripcion", (object)descripcion ?? DBNull.Value);
                                cmdDet.Parameters.AddWithValue("@cantidad", cantidad);
                                cmdDet.Parameters.AddWithValue("@unidad", (object)unidad ?? DBNull.Value);
                                cmdDet.Parameters.AddWithValue("@obs", (object)obs ?? DBNull.Value);
                                cmdDet.ExecuteNonQuery();
                            }

                            // Obtener precio promedio para valorizar salida (opcional)
                            decimal precioPromedio = 0;
                            using (MySqlCommand cmdPrecio = new MySqlCommand(@"SELECT 
CASE WHEN SUM(CASE WHEN tipo_movimiento='INGRESO' AND precio_unitario IS NOT NULL THEN cantidad ELSE 0 END) > 0
THEN SUM(CASE WHEN tipo_movimiento='INGRESO' AND precio_unitario IS NOT NULL THEN cantidad*precio_unitario ELSE 0 END)/
     SUM(CASE WHEN tipo_movimiento='INGRESO' AND precio_unitario IS NOT NULL THEN cantidad ELSE 0 END)
ELSE 0 END
FROM MOVIMIENTO_KARDEX WHERE codigo_producto=@c AND proyecto=@p", conn, tx))
                            {
                                cmdPrecio.Parameters.AddWithValue("@c", codigo ?? (object)DBNull.Value);
                                cmdPrecio.Parameters.AddWithValue("@p", proyecto);
                                object precioObj = cmdPrecio.ExecuteScalar();
                                if (precioObj != null && precioObj != DBNull.Value) decimal.TryParse(precioObj.ToString(), out precioPromedio);
                            }

                            using (MySqlCommand cmdKardex = new MySqlCommand(@"INSERT INTO MOVIMIENTO_KARDEX 
(fecha, tipo_movimiento, codigo_producto, descripcion, unidad, cantidad, proyecto, documento, observaciones, precio_unitario)
VALUES (@fecha,'SALIDA',@codigo,@descripcion,@unidad,@cantidad,@proyecto,@documento,@observaciones,@precio_unitario)", conn, tx))
                            {
                                cmdKardex.Parameters.AddWithValue("@fecha", fechaRegistro);
                                cmdKardex.Parameters.AddWithValue("@codigo", (object)codigo ?? DBNull.Value);
                                cmdKardex.Parameters.AddWithValue("@descripcion", (object)descripcion ?? DBNull.Value);
                                cmdKardex.Parameters.AddWithValue("@unidad", (object)unidad ?? DBNull.Value);
                                cmdKardex.Parameters.AddWithValue("@cantidad", cantidad);
                                cmdKardex.Parameters.AddWithValue("@proyecto", proyecto);
                                cmdKardex.Parameters.AddWithValue("@documento", numeroSalida);
                                cmdKardex.Parameters.AddWithValue("@observaciones", string.IsNullOrWhiteSpace(obs)?"Salida de materiales":$"Salida de materiales - {obs}");
                                if (precioPromedio > 0)
                                    cmdKardex.Parameters.AddWithValue("@precio_unitario", precioPromedio);
                                else
                                    cmdKardex.Parameters.AddWithValue("@precio_unitario", DBNull.Value);
                                cmdKardex.ExecuteNonQuery();
                            }
                        }

                        tx.Commit();
                    }
                }

                MessageBox.Show("Salida registrada y stock actualizado (Kardex).", "Salida de Materiales", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return true;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error al guardar salida: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return false;
            }
        }

        private void GenerarPDFSalidaConDatos(string numeroSalida, string proyectoNombre, string trabajadorNombre, string trabajadorDni, string trabajadorArea, byte[] firmaImagen)
        {
            try
            {
                // Obtener firma del usuario logueado
                byte[] firmaUsuarioLogueado = ObtenerFirmaUsuarioLogueado();
                
                string htmlContent = GenerarHtmlSalidaConDatos(numeroSalida, proyectoNombre, trabajadorNombre, trabajadorDni, trabajadorArea, firmaImagen, firmaUsuarioLogueado);
                string htmlValidado = PdfManager.ValidateAndCleanHtml(htmlContent);
                using SaveFileDialog saveDialog = new SaveFileDialog
                {
                    Filter = "Archivos PDF (*.pdf)|*.pdf",
                    Title = "Guardar Comprobante de Salida de Materiales",
                    FileName = $"Salida_Materiales_{numeroSalida}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf",
                    DefaultExt = "pdf"
                };
                if (saveDialog.ShowDialog() == DialogResult.OK)
                {
                    byte[] pdfBytes = PdfManager.GeneratePdfSafely(htmlValidado);
                    File.WriteAllBytes(saveDialog.FileName, pdfBytes);
                    if (MessageBox.Show($" PDF generado:\n\n{saveDialog.FileName}\n\n¿Abrir ahora?", "PDF Creado", MessageBoxButtons.YesNo, MessageBoxIcon.Information) == DialogResult.Yes)
                    {
                        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo { FileName = saveDialog.FileName, UseShellExecute = true });
                    }
                }
            }
            catch (Exception ex)
            { MessageBox.Show("Error al generar PDF: " + ex.Message); }
        }

        private string GenerarHtmlSalidaConDatos(string numeroSalida, string proyectoNombre, string trabajadorNombre, string trabajadorDni, string trabajadorArea, byte[] firmaImagen, byte[] firmaUsuarioLogueado)
        {
            var sb = new StringBuilder();
            string firmaReceptorBase64 = (firmaImagen != null && firmaImagen.Length > 0) ? Convert.ToBase64String(firmaImagen) : string.Empty;
            string firmaEntregaBase64 = (firmaUsuarioLogueado != null && firmaUsuarioLogueado.Length > 0) ? Convert.ToBase64String(firmaUsuarioLogueado) : string.Empty;

            // Plantilla optimizada para una sola página - tamaño más grande
            sb.Append(@"<!DOCTYPE html><html lang='es'><head><meta charset='utf-8'><title>Comprobante de Salida</title><style>
                *{box-sizing:border-box;margin:0;padding:0;}
                body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;font-size:11px;color:#243238;background:#fff;line-height:1.2;}
                .doc{max-width:950px;margin:15px auto;padding:0 40px 25px 40px;}
                h1{font-size:16px;font-weight:600;text-align:center;margin:0 0 18px 0;color:#0F3658;}
                .doc-number{border:1px solid #d9dee3;padding:15px 20px;margin:0 0 22px 0;background:#fafbfc;text-align:center;}
                .doc-number .numero{display:block;font-size:13px;color:#0F3658;font-weight:700;margin-bottom:5px;}
                .doc-number .fecha{display:block;font-size:10px;color:#687888;font-weight:400;}
                table{border-collapse:collapse;width:100%;}
                .info{width:100%;border:1px solid #d9dee3;margin:0 0 20px 0;}
                .info th{width:160px;font-size:11px;text-align:left;padding:8px 14px;background:#f3f5f7;font-weight:600;color:#19384f;border-bottom:1px solid #d9dee3;border-right:1px solid #d9dee3;}
                .info td{font-size:11px;padding:8px 16px;color:#243238;border-bottom:1px solid #d9dee3;}
                .info tr:last-child th,.info tr:last-child td{border-bottom:none;}
                .section-title{font-size:13px;font-weight:600;color:#19384f;margin:0 0 8px 0;}
                .detalle{border:1px solid #d9dee3;margin:0;}
                .detalle thead th{background:#f3f5f7;font-size:11px;font-weight:600;color:#1d2d3a;padding:8px 12px;text-align:center;border-right:1px solid #d9dee3;}
                .detalle thead th:last-child{border-right:none;}
                .detalle tbody td{font-size:11px;padding:7px 12px;border-top:1px solid #d9dee3;border-right:1px solid #d9dee3;vertical-align:top;}
                .detalle tbody td:last-child{border-right:none;}
                .detalle tbody td.codigo{font-weight:600;color:#0a55a5;}
                .detalle tbody td.cant{text-align:center;font-weight:600;}
                .detalle tbody td.unid{text-align:center;}
                .detalle tbody td.obs{font-style:italic;color:#7c8790;}
                .summary{border:1px solid #d9dee3;border-top:none;padding:10px 20px;font-size:11px;display:flex;justify-content:flex-end;}
                .summary div{text-align:right;line-height:1.3;}
                .instructions{background:#fff6dd;border:1px solid #f3dca6;padding:12px 20px;font-size:10px;margin:18px 0 22px 0;}
                .instructions b{display:block;margin-bottom:6px;font-size:11px;color:#6d5300;}
                .instructions ul{margin:0;padding-left:20px;}
                .instructions li{margin:3px 0;}
                .sigs{border:1px solid #d9dee3;padding:30px 25px 25px 25px;display:flex;justify-content:space-around;align-items:flex-end;gap:100px;margin-bottom:18px;}
                .sig{width:45%;text-align:center;display:flex;flex-direction:column;align-items:center;}
                .sig-img{max-width:140px;max-height:55px;margin-bottom:12px;display:block;}
                .sig-line{width:85%;height:1.2px;background:#192b37;margin-bottom:8px;}
                .sig-label{font-size:10px;color:#55626b;font-weight:500;line-height:1.3;}
                footer{margin-top:15px;text-align:center;font-size:9px;color:#6d7880;line-height:1.4;padding-top:12px;border-top:1px solid #e0e0e0;}
                @page{margin:12mm 12mm 12mm 12mm;size:A4;}
                @media print{body{font-size:10px;}.doc{margin:0;padding:0 25px 15px 25px;}.sigs{padding:25px 20px 20px 20px;}.sig-img{max-height:50px;}}
            </style></head><body><div class='doc'>
            <h1>Comprobante de Salida de Materiales</h1>
            <div class='doc-number'>
                <span class='numero'>DOCUMENTO N°: ");
            sb.Append(PdfTemplateHelper.EscapeHtml(numeroSalida));
            sb.Append("</span>");
            sb.Append("<span class='fecha'>Fecha de emisión: ")
              .Append(DateTime.Now.ToString("dd/MM/yyyy"))
              .Append("</span></div>");

            // Tabla de información principal (más compacta)
            sb.Append("<table class='info'>")
              .Append("<tr><th>Proyecto:</th><td>")
              .Append(PdfTemplateHelper.EscapeHtml(proyectoNombre))
              .Append("</td></tr>")
              .Append("<tr><th>Fecha Registro:</th><td>")
              .Append(DateTime.Now.ToString("dd/MM/yyyy HH:mm"))
              .Append("</td></tr>")
              .Append("<tr><th>Responsable Recepcion:</th><td>")
              .Append(PdfTemplateHelper.EscapeHtml(trabajadorNombre))
              .Append("</td></tr>")
              .Append("<tr><th>DNI:</th><td>")
              .Append(PdfTemplateHelper.EscapeHtml(trabajadorDni))
              .Append("</td></tr>")
              .Append("<tr><th>Área:</th><td>")
              .Append(PdfTemplateHelper.EscapeHtml(trabajadorArea))
              .Append("</td></tr>")
              .Append("<tr><th>Usuario Sistema:</th><td>")
              .Append(PdfTemplateHelper.EscapeHtml(UserSession.IsLoggedIn ? (UserSession.UserName ?? UserSession.FullName) : Environment.UserName))
              .Append("</td></tr>")
              .Append("</table>");

            // Detalle de materiales
            sb.Append("<div class='section-title'>Detalle de Materiales a Entregar</div>")
              .Append("<table class='detalle'><thead><tr><th style='width:80px;'>Código</th><th>Descripción del Material</th><th style='width:70px;'>Cantidad</th><th style='width:60px;'>Unidad</th><th style='width:180px;'>Observaciones</th></tr></thead><tbody>");
            int totalItems = 0; int totalCantidad = 0;
            foreach (DataGridViewRow row in dataGridViewDetalle.Rows)
            {
                if (row.IsNewRow) continue;
                string codigo = row.Cells["Codigo"].Value?.ToString() ?? string.Empty;
                string desc = row.Cells["Descripcion"].Value?.ToString() ?? string.Empty;
                int cantidad = 0; int.TryParse(row.Cells["Cantidad"].Value?.ToString(), out cantidad);
                string unidad = row.Cells["Unidad"].Value?.ToString() ?? string.Empty;
                string obs = row.Cells["Observacion"].Value?.ToString();
                if (string.IsNullOrWhiteSpace(obs)) obs = "Sin observaciones";

                sb.Append("<tr><td class='codigo'>")
                  .Append(PdfTemplateHelper.EscapeHtml(codigo))
                  .Append("</td><td>")
                  .Append(PdfTemplateHelper.EscapeHtml(desc))
                  .Append("</td><td class='cant'>")
                  .Append(cantidad)
                  .Append("</td><td class='unid'>")
                  .Append(PdfTemplateHelper.EscapeHtml(unidad))
                  .Append("</td><td class='obs'>")
                  .Append(PdfTemplateHelper.EscapeHtml(obs))
                  .Append("</td></tr>");
                totalItems++; totalCantidad += cantidad;
            }
            if (totalItems == 0)
            {
                sb.Append("<tr><td colspan='5' style='text-align:center;color:#8a97a1;padding:12px;'>Sin materiales</td></tr>");
            }
            sb.Append("</tbody></table>");

            sb.Append("<div class='summary'><div>" + "Total: " + totalItems + " productos | Cantidad: " + totalCantidad + " unidades" + "</div></div>");

            // Instrucciones más compactas
            sb.Append("<div class='instructions'><b>Instrucciones:</b><ul>" +
                      "<li>Verificar estado de materiales antes de entrega</li>" +
                      "<li>Confirmar recepción y conformidad</li>" +
                      "<li>Actualizar registros de inventario</li>" +
                      "<li>Conservar documento como respaldo</li>" +
                      "</ul></div>");

            // Firmas compactas
            sb.Append("<div class='sigs'>");

            // Firma de Recepcion (Usuario logueado)
            sb.Append("<div class='sig'>");
            if (!string.IsNullOrEmpty(firmaEntregaBase64))
                sb.Append("<img class='sig-img' src='data:image/png;base64,").Append(firmaEntregaBase64).Append("' alt='Firma Entrega' />");
            sb.Append("<div class='sig-line'></div>");
            sb.Append("<div class='sig-label'><strong>Responsable Recepcion</strong><br>");
            if (UserSession.IsLoggedIn)
                sb.Append(PdfTemplateHelper.EscapeHtml(UserSession.FullName)).Append("<br>");
            sb.Append("</div></div>");

            // Firma de Entrega (Trabajador entrega)
            sb.Append("<div class='sig'>");
            if (!string.IsNullOrEmpty(firmaReceptorBase64))
                sb.Append("<img class='sig-img' src='data:image/png;base64,").Append(firmaReceptorBase64).Append("' alt='Firma Recepción' />");
            sb.Append("<div class='sig-line'></div>");
            sb.Append("<div class='sig-label'><strong>Responsable Entrega</strong><br>");
            if (!string.IsNullOrEmpty(trabajadorNombre))
                sb.Append(PdfTemplateHelper.EscapeHtml(trabajadorNombre)).Append("<br>");
            sb.Append("</div></div>");

            sb.Append("</div>");

            // Footer compacto
            sb.Append("<footer>");
            sb.Append("<strong>SISTEMA DE GESTIÓN DE MATERIALES</strong><br>");
            sb.Append("logistica@empresa.com | Tel. (01) 234-5678 | www.empresa.com<br>");
            sb.Append("<em>Documento generado automáticamente</em>");
            sb.Append("</footer>");
            
            sb.Append("</div></body></html>");
            return sb.ToString();
        }

        /// <summary>
        /// Obtiene la firma del usuario logueado desde la tabla LOGEO
        /// </summary>
        private byte[] ObtenerFirmaUsuarioLogueado()
        {
            if (!UserSession.IsLoggedIn)
                return null;

            try
            {
                using (MySqlConnection conn = ConexionDB.GetConnection())
                {
                    conn.Open();
                    string query = "SELECT firma FROM LOGEO WHERE id = @userId";
                    
                    using (MySqlCommand cmd = new MySqlCommand(query, conn))
                    {
                        // CORRECCIÓN: Manejo seguro del UserId que puede ser Int64
                        object userIdValue = UserSession.UserId;
                        if (userIdValue is long longUserId)
                        {
                            cmd.Parameters.AddWithValue("@userId", longUserId);
                        }
                        else if (userIdValue is int intUserId)
                        {
                            cmd.Parameters.AddWithValue("@userId", intUserId);
                        }
                        else if (userIdValue != null)
                        {
                            cmd.Parameters.AddWithValue("@userId", userIdValue);
                        }
                        else
                        {
                            return null; // No hay usuario válido
                        }
                        
                        object result = cmd.ExecuteScalar();
                        if (result != null && result != DBNull.Value)
                        {
                            return (byte[])result;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error al obtener firma del usuario logueado: {ex.Message}");
            }
            
            return null;
        }

        private void LimpiarFormulario()
        {
            dataGridViewDetalle.Rows.Clear();
            comboBoxProyecto.SelectedIndex = 0; comboBoxTrabajador.SelectedIndex = 0; comboBoxCodigo.DataSource = null; comboBoxCodigo.Items.Clear();
            textBoxDescripcion.Text = ""; textBoxUnidad.Text = ""; txtStock.Text = ""; textBoxCantidad.Text = ""; textBoxObservacion.Text = ""; txtArea.Text = ""; txtDni.Text = ""; Firma.Image = null; Firma.Visible = false;
        }

        private void Salida_De_Materiales_Load(object sender, System.EventArgs e)
        {
            comboBoxProyecto.SelectedIndexChanged -= comboBoxProyecto_SelectedIndexChanged; comboBoxProyecto.SelectedIndexChanged += comboBoxProyecto_SelectedIndexChanged;
            comboBoxCodigo.SelectedIndexChanged -= comboBoxCodigo_SelectedIndexChanged; comboBoxCodigo.SelectedIndexChanged += comboBoxCodigo_SelectedIndexChanged;
            comboBoxTrabajador.SelectedIndexChanged -= comboBoxTrabajador_SelectedIndexChanged; comboBoxTrabajador.SelectedIndexChanged += comboBoxTrabajador_SelectedIndexChanged;
            if (dataGridViewDetalle.Columns.Count == 0)
            {
                dataGridViewDetalle.Columns.Add("Codigo", "Código");
                dataGridViewDetalle.Columns.Add("Descripcion", "Descripción");
                dataGridViewDetalle.Columns.Add("Cantidad", "Cantidad");
                dataGridViewDetalle.Columns.Add("Unidad", "Unidad");
                dataGridViewDetalle.Columns.Add("Observacion", "Observación");
                dataGridViewDetalle.AllowUserToAddRows = false;
            }
        }

        private void btnPrestamo_Click(object sender, System.EventArgs e)
        {
            try { var prestamoForm = new Prestamo(); prestamoForm.Show(); }
            catch (System.Exception ex) { MessageBox.Show("Error al abrir formulario de préstamo: " + ex.Message); }
        }

        private void labelCodigo_Click(object sender, System.EventArgs e)
        {
            /* Evento del label DNI (sin acción) */
        }
    }
}