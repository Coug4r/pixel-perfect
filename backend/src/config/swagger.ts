export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "MekaTurn API - Sistema de Turnos para Taller Mecánico",
    version: "1.0.0",
    description:
      "Backend oficial y robusto para la administración de turnos, atención técnica, diagnósticos y calificaciones de taller mecánico.",
    contact: {
      name: "Soporte Técnico MekaTurn",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor Local de Desarrollo",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Ingresa el token JWT recibido en el endpoint de login",
      },
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["identificacion", "password"],
        properties: {
          identificacion: { type: "string", example: "1100000001" },
          password: { type: "string", example: "123456" },
        },
      },
      CrearTurnoRequest: {
        type: "object",
        required: ["identificacion", "tipoIdentificacion", "nombre", "celular", "placa", "motivo"],
        properties: {
          identificacion: { type: "string", example: "1100000004" },
          tipoIdentificacion: { type: "string", enum: ["CEDULA", "PASAPORTE"], example: "CEDULA" },
          nombre: { type: "string", example: "Juan Pérez" },
          celular: { type: "string", example: "0991234567" },
          placa: { type: "string", example: "ABC1234" },
          motivo: { type: "string", example: "El vehículo presenta problemas al frenar" },
          mecanicoPreferidoId: { type: "string", format: "uuid", nullable: true, example: null },
        },
      },
      ConsultarTurnoRequest: {
        type: "object",
        required: ["numeroTurno", "placa"],
        properties: {
          numeroTurno: { type: "integer", example: 1 },
          placa: { type: "string", example: "ABC1234" },
        },
      },
      CrearDiagnosticoRequest: {
        type: "object",
        required: ["descripcion"],
        properties: {
          descripcion: { type: "string", example: "Desgaste severo en pastillas y zapatas de frenos." },
          observaciones: { type: "string", example: "Requiere rectificación de discos." },
          trabajoRealizado: { type: "string", example: "Reemplazo de pastillas delanteras." },
          recomendaciones: { type: "string", example: "Revisar líquido de frenos en 5000 km." },
        },
      },
      CrearCalificacionRequest: {
        type: "object",
        required: ["numeroTurno", "placa", "estrellas"],
        properties: {
          numeroTurno: { type: "integer", example: 1 },
          placa: { type: "string", example: "ABC1234" },
          estrellas: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comentario: { type: "string", example: "Excelente servicio y rapidez." },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "ERROR_CODE" },
              message: { type: "string", example: "Descripción del error" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/v1/auth/login": {
      post: {
        summary: "Iniciar sesión de mecánico o superadmin",
        tags: ["Autenticación"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          200: { description: "Autenticación exitosa con JWT" },
          401: { description: "Credenciales inválidas" },
        },
      },
    },
    "/api/v1/turnos": {
      post: {
        summary: "Solicitar nuevo turno (Público - Clientes)",
        tags: ["Turnos"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CrearTurnoRequest" } } },
        },
        responses: {
          201: { description: "Turno creado exitosamente con número diario correlativo" },
          422: { description: "Error de validación en cédula, celular o placa" },
        },
      },
    },
    "/api/v1/turnos/consulta": {
      post: {
        summary: "Consultar turno por número y placa (Público - Clientes)",
        tags: ["Turnos"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ConsultarTurnoRequest" } } },
        },
        responses: {
          200: { description: "Información pública del turno y diagnósticos" },
          404: { description: "Turno no encontrado" },
        },
      },
    },
    "/api/v1/turnos/{id}/tomar": {
      post: {
        summary: "Tomar turno disponible (Mecánico)",
        tags: ["Mecánico - Operaciones"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Turno asignado e iniciada atención" },
          409: { description: "Conflicto por concurrencia: el turno ya fue tomado por otro mecánico" },
        },
      },
    },
    "/api/v1/turnos/{id}/diagnosticos": {
      post: {
        summary: "Agregar diagnóstico técnico al turno (Mecánico)",
        tags: ["Diagnósticos"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CrearDiagnosticoRequest" } } },
        },
        responses: {
          201: { description: "Diagnóstico registrado exitosamente" },
        },
      },
      get: {
        summary: "Listar diagnósticos técnicos de un turno",
        tags: ["Diagnósticos"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Listado de diagnósticos" },
        },
      },
    },
    "/api/v1/diagnosticos/{id}": {
      patch: {
        summary: "Editar diagnóstico técnico (Mecánico autor)",
        tags: ["Diagnósticos"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CrearDiagnosticoRequest" } } },
        },
        responses: {
          200: { description: "Diagnóstico modificado" },
        },
      },
    },
    "/api/v1/turnos/{id}/listo": {
      patch: {
        summary: "Marcar vehículo listo para entrega (Mecánico)",
        tags: ["Mecánico - Operaciones"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Estado actualizado a LISTO" },
        },
      },
    },
    "/api/v1/turnos/{id}/finalizar": {
      patch: {
        summary: "Finalizar atención del turno y liberar mecánico (Mecánico)",
        tags: ["Mecánico - Operaciones"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Estado actualizado a FINALIZADO y mecánico disponible" },
        },
      },
    },
    "/api/v1/turnos/{id}/no-asistio": {
      patch: {
        summary: "Registrar inasistencia del cliente (Mecánico)",
        tags: ["Mecánico - Operaciones"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Estado actualizado a NO_ASISTIO" },
        },
      },
    },
    "/api/v1/turnos/{id}/reagendar": {
      patch: {
        summary: "Reagendar turno para el mismo día (Mecánico)",
        tags: ["Mecánico - Operaciones"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Turno reagendado" },
        },
      },
    },
    "/api/v1/turnos/{id}/calificacion": {
      post: {
        summary: "Calificar servicio finalizado (Público - Clientes)",
        tags: ["Calificaciones"],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CrearCalificacionRequest" } } },
        },
        responses: {
          201: { description: "Calificación registrada" },
          409: { description: "Turno no finalizado o ya calificado anteriormente" },
        },
      },
    },
    "/api/v1/mecanico/dashboard": {
      get: {
        summary: "Obtener estadísticas y turnos del dashboard del mecánico",
        tags: ["Mecánico - Portal"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Dashboard del mecánico" },
        },
      },
    },
    "/api/v1/mecanico/turnos": {
      get: {
        summary: "Obtener turnos del mecánico agrupados en EN_COLA, DIAGNOSTICADOS y FINALIZADOS",
        tags: ["Mecánico - Portal"],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "placa", in: "query", schema: { type: "string" }, description: "Filtro opcional por placa" }],
        responses: {
          200: { description: "Listado agrupado de turnos" },
        },
      },
    },
    "/api/v1/admin/historial": {
      get: {
        summary: "Consultar historial global de turnos (Superadmin)",
        tags: ["Superadmin"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Historial paginado" },
          403: { description: "Prohibido para mecánicos o usuarios sin permisos de Superadmin" },
        },
      },
    },
    "/api/v1/admin/calificaciones": {
      get: {
        summary: "Consultar calificaciones y comentarios (Superadmin)",
        tags: ["Superadmin"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Calificaciones paginadas" },
          403: { description: "Prohibido para mecánicos" },
        },
      },
    },
    "/api/v1/admin/diagnosticos": {
      get: {
        summary: "Consultar todos los diagnósticos históricos (Superadmin)",
        tags: ["Superadmin"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Diagnósticos paginados" },
          403: { description: "Prohibido para mecánicos" },
        },
      },
    },
  },
};
