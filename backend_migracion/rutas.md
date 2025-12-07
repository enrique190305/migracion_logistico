PS C:\Users\USUARIO11\Desktop\Flutter_app_prueba\Migracion--Appshet\Backend_Migracion> php artisan route:list

  GET|HEAD  / ............................................................................................................................................ 
  POST      api/v1/asistencia/entrada ......................................................................... RegistroAsistenciaController@marcarEntrada  
  POST      api/v1/asistencia/puede-marcar-entrada ....................................................... RegistroAsistenciaController@puedeMarcarEntrada  
  POST      api/v1/asistencia/puede-reportar .................................................................. RegistroAsistenciaController@puedeReportar  
  POST      api/v1/asistencia/registrar ................................................................................ ApiController@registrarAsistencia  
  POST      api/v1/asistencia/salida ........................................................................... RegistroAsistenciaController@marcarSalida  
  GET|HEAD  api/v1/asistencia/trabajador ........................................................................... ApiController@getAsistenciaTrabajador  
  GET|HEAD  api/v1/asistencia/verificar/{idUsuario} ............................................................ ApiController@verificarAsistenciaCompleta  
  POST      api/v1/auth/login ....................................................................................................... AuthController@login  
  POST      api/v1/auth/logout ..................................................................................................... AuthController@logout  
  GET|HEAD  api/v1/auth/me ............................................................................................................. AuthController@me  
  POST      api/v1/auth/simple-login .....................................................................................................................  
  POST      api/v1/auth/validate-token ...................................................................................... AuthController@validateToken  
  GET|HEAD  api/v1/configuracion .......................................................................................... ApiController@getConfiguracion  
  GET|HEAD  api/v1/debug ............................................................................................................ TestController@debug  
  POST      api/v1/emergencias/registrar ............................................................................... ApiController@registrarEmergencia  
  GET|HEAD  api/v1/horarios ............................................................................................ HorarioController@obtenerHorarios  
  POST      api/v1/horarios ............................................................................................... HorarioController@crearHorario  
  GET|HEAD  api/v1/horarios/{id} ................................................................................... HorarioController@obtenerHorarioPorId  
  PUT       api/v1/horarios/{id} ..................................................................................... HorarioController@actualizarHorario  
  DELETE    api/v1/horarios/{id} ....................................................................................... HorarioController@eliminarHorario  
  GET|HEAD  api/v1/jornadas/activa ........................................................................................ ApiController@getJornadaActiva  
  GET|HEAD  api/v1/jornadas/todas ......................................................................................... ApiController@getTodasJornadas  
  GET|HEAD  api/v1/jornadas/usuario ..................................................................................... ApiController@getJornadasUsuario  
  DELETE    api/v1/photos/delete ............................................................................................. PhotoController@deletePhoto  
  POST      api/v1/photos/upload ............................................................................................. PhotoController@uploadPhoto  
  GET|HEAD  api/v1/photos/{filePath} ............................................................................................ PhotoController@getPhoto  
  POST      api/v1/programacion/asignar-masivo ................................................................... ProgramacionController@asignacionMasiva  
  GET|HEAD  api/v1/programacion/dia ............................................................................ ProgramacionController@getProgramacionDia  
  GET|HEAD  api/v1/programacion/estadisticas ................................................................... ProgramacionController@getEstadisticasDia  
  POST      api/v1/programacion/guardar ....................................................................... ProgramacionController@guardarAsignaciones  
  GET|HEAD  api/v1/programacion/historial/fecha ................................................................. ProgramacionController@getHistorialFecha  
  GET|HEAD  api/v1/programacion/historial/usuario/{idUsuario} ................................................. ProgramacionController@getHistorialUsuario  
  GET|HEAD  api/v1/programacion/horarios .............................................................................. ProgramacionController@getHorarios  
  DELETE    api/v1/programacion/limpiar ................................................................................ ProgramacionController@limpiarDia  
  GET|HEAD  api/v1/programacion/mes ............................................................................ ProgramacionController@getProgramacionMes  
  GET|HEAD  api/v1/programacion/trabajadores ...................................................................... ProgramacionController@getTrabajadores  
  GET|HEAD  api/v1/reportes/asistencia ................................................................................ ApiController@getReporteAsistencia  
  GET|HEAD  api/v1/reportes/emergencias ..................................................................................... ApiController@getEmergencias  
  GET|HEAD  api/v1/reportes/horarios ................................................................................... ApiController@getReportesHorarios  
  GET|HEAD  api/v1/reportes/horarios-por-sede ................................................................... ApiController@getReportesHorariosPorSede  
  POST      api/v1/reportes/registrar ..................................................................................... ApiController@registrarReporte  
  GET|HEAD  api/v1/sedes .......................................................................................................... ApiController@getSedes  
  GET|HEAD  api/v1/supervisor/asistencia ........................................................................... ApiController@getAsistenciaTrabajador  
  GET|HEAD  api/v1/supervisor/emergencias ................................................................................... ApiController@getEmergencias  
  GET|HEAD  api/v1/supervisor/reportes-horarios ........................................................................ ApiController@getReportesHorarios  
  GET|HEAD  api/v1/supervisor/reportes-horarios-por-sede ........................................................ ApiController@getReportesHorariosPorSede  
  GET|HEAD  api/v1/supervisor/trabajadores ................................................................................. ApiController@getTrabajadores  
  GET|HEAD  api/v1/test ..................................................................................................................................  
  POST      api/v1/test-login ................................................................................................... TestController@testLogin  
  GET|HEAD  api/v1/test/db ...............................................................................................................................  
  GET|HEAD  api/v1/tiempo-actual .........................................................................................................................  
  GET|HEAD  api/v1/trabajadores ............................................................................................ ApiController@getTrabajadores  
  GET|HEAD  api/v1/usuarios ............................................................................................ UsuarioController@obtenerUsuarios  
  POST      api/v1/usuarios ................................................................................................... ApiController@crearUsuario  
  GET|HEAD  api/v1/usuarios/horario/{horarioId} .............................................................. UsuarioController@obtenerUsuariosPorHorario  
  PUT       api/v1/usuarios/{id} ............................................................................................. ApiController@editarUsuario  
  DELETE    api/v1/usuarios/{id} ........................................................................................... ApiController@eliminarUsuario  
  GET|HEAD  api/v1/usuarios/{id} ................................................................................... UsuarioController@obtenerUsuarioPorId  
  POST      api/v1/usuarios/{userId}/horario ............................................................................ UsuarioController@asignarHorario  
  DELETE    api/v1/usuarios/{userId}/horario ............................................................................ UsuarioController@removerHorario  
  GET|HEAD  api/{fallbackPlaceholder} ....................................................................................................................  
  GET|HEAD  sanctum/csrf-cookie ........................................................ sanctum.csrf-cookie › Laravel\Sanctum › CsrfCookieController@show  
  GET|HEAD  storage/{path} ................................................................................................................. storage.local  
  GET|HEAD  up ........................................................................................................................................... 