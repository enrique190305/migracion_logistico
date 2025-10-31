# 🏦 GUÍA: AGREGAR LOGOS DE BANCOS

## 📁 Estructura de carpetas requerida

Los logos deben estar en:
```
backend_migracion/laravel/storage/app/public/bancos/
```

## 🔧 Pasos para configurar:

### 1. Crear el enlace simbólico (si no existe)
```powershell
cd backend_migracion/laravel
php artisan storage:link
```

Este comando crea un enlace simbólico de `storage/app/public` a `public/storage`

### 2. Crear la carpeta de bancos
```powershell
mkdir storage/app/public/bancos
```

### 3. Subir los logos de los bancos

Descarga los logos y guárdalos con estos nombres:

```
storage/app/public/bancos/
├── bcp.png
├── bbva.png
├── scotiabank.png
├── interbank.png
├── pichincha.png
├── banbif.png
├── gnb.png
├── falabella.png
├── ripley.png
├── azteca.png
├── caja_arequipa.png
├── caja_huancayo.png
├── caja_cusco.png
├── banco_nacion.png
└── otros.png
```

### 4. Características de las imágenes:

✅ **Formato:** PNG con fondo transparente (preferido) o JPG
✅ **Tamaño recomendado:** 200x80 píxeles (ancho x alto)
✅ **Peso máximo:** 50 KB por imagen
✅ **Nombre:** En minúsculas, sin espacios, con guiones bajos

## 🔗 URLs para descargar logos oficiales:

1. **BCP:** https://www.viabcp.com/
2. **BBVA:** https://www.bbva.pe/
3. **Scotiabank:** https://www.scotiabank.com.pe/
4. **Interbank:** https://interbank.pe/
5. **Banco Pichincha:** https://www.pichincha.pe/
6. **BanBif:** https://www.banbif.com.pe/
7. **Banco GNB:** https://www.gnbperu.com.pe/
8. **Banco Falabella:** https://www.bancofalabella.pe/
9. **Banco Ripley:** https://www.bancoripley.com.pe/
10. **Banco Azteca:** https://www.bancoazteca.com.pe/
11. **Caja Arequipa:** https://www.cajaarequipa.pe/
12. **Caja Huancayo:** https://www.cajahuancayo.com.pe/
13. **Caja Cusco:** https://www.cmac-cusco.com.pe/
14. **Banco de la Nación:** https://www.bn.com.pe/
15. **Otros:** Crear un logo genérico (icono de banco)

## 🎨 Alternativa: Usar logos de brandlogos.net o seeklogo.com

```
https://seeklogo.com/vector-logos/banco-de-credito-del-peru-bcp
```

## ✅ Verificación

Después de subir los logos, verifica que sean accesibles:
```
http://localhost:8000/storage/bancos/bcp.png
http://localhost:8000/storage/bancos/bbva.png
```

## 🔄 Actualizar la base de datos (opcional)

Si quieres usar URLs externas en lugar de archivos locales, puedes actualizar:

```sql
UPDATE banco SET logo_banco = 'https://url-del-logo.com/bcp.png' WHERE codigo_banco = '002';
```

---

## 📝 Notas:

- Los logos se mostrarán en los PDFs de OC/OS
- Tamaño en el PDF: 25px de altura
- Si el logo no se encuentra, solo se mostrará el texto del banco
- El atributo `onerror` oculta la imagen si no se encuentra

---

## 🚀 ¡Listo!

Una vez subidos los logos, se mostrarán automáticamente en los PDFs generados.
