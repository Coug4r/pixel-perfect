# MekaTurn Backend - Sistema de Turnos para Taller Mecánico

Backend profesional, modular y seguro para la administración integral de turnos automotrices, atención en taller, registro múltiple de diagnósticos técnicos y calificaciones de clientes.

Diseñado con arquitectura limpia en capas (Controlador -> Servicio -> Prisma ORM -> PostgreSQL), validaciones estrictas con Zod, eventos en tiempo real con Socket.IO y documentación interactiva OpenAPI/Swagger.

---

## 1. Arquitectura y Tecnologías Obligatorias

* **Runtime:** Node.js (v20+)
* **Lenguaje:** TypeScript (Strict Mode)
* **Framework HTTP:** Express
* **Base de Datos:** PostgreSQL 16
* **ORM:** Prisma ORM
* **Autenticación y Seguridad:** JWT, bcryptjs, Helmet, CORS, express-rate-limit
* **Validación de Esquemas:** Zod
* **Tiempo Real:** Socket.IO (WebSockets)
* **Documentación:** Swagger UI / OpenAPI 3.0 (`/api/docs`)
* **Testing:** Vitest + Supertest

---

## 2. Estructura del Proyecto

```text
backend/
├── prisma/
│   ├── schema.prisma       # Modelos relacionales, enums e índices
│   └── seed.ts             # Datos maestros (Superadmin, mecánicos, clientes)
├── src/
│   ├── config/             # Configuración de entorno, Prisma y Swagger
│   ├── controllers/        # Controladores HTTP desacoplados
│   ├── middlewares/        # Autenticación JWT, roles RBAC, Zod y errores
│   ├── routes/             # Enrutamiento modular Express (/api/v1)
│   ├── services/           # Reglas de negocio y transacciones atómicas
│   ├── types/              # Tipos TypeScript e interfaces de respuesta
│   ├── utils/              # Validadores de cédula ecuatoriana, JWT, password
│   ├── validators/         # Esquemas de validación Zod
│   ├── websocket/          # Servidor y emisores tipados de Socket.IO
│   ├── app.ts              # Configuración de Express y middlewares
│   └── server.ts           # Inicialización de HTTP, WebSockets y base de datos
├── tests/
│   ├── api.test.ts         # Pruebas de integración E2E (Auth, Turnos, Concurrencia)
│   └── validators.test.ts  # Pruebas unitarias de algoritmos ecuatorianos
├── .env.example            # Plantilla de variables de entorno
├── docker-compose.yml      # Contenedor oficial PostgreSQL 16
├── package.json            # Dependencias y scripts de ejecución
├── tsconfig.json           # Configuración de compilación TypeScript
└── README.md
```

---

## 3. Instalación y Puesta en Marcha

### Prerrequisitos
* Node.js v20 o superior
* Docker / Docker Compose (o PostgreSQL instalado localmente)
* npm

### Paso 1: Clonar o ingresar a la carpeta backend
```bash
cd backend
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar variables de entorno
Copiar el archivo de ejemplo:
```bash
cp .env.example .env
```
Asegurar que la variable `DATABASE_URL` apunte a tu instancia de PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:6545319Aa%40@localhost:5432/mecanicaKart?schema=public"
JWT_SECRET="mekaturn_super_secret_jwt_key_2026_x99"
JWT_EXPIRES_IN="8h"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```
*(Nota: Si la contraseña contiene el caracter '@', en la URL de conexión se codifica como `%40`)*.

### Paso 4: Levantar PostgreSQL (si utilizas Docker)
```bash
docker compose up -d
```

### Paso 5: Generar el cliente de Prisma y ejecutar migraciones
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Paso 6: Poblar la base de datos con el Seed inicial
```bash
npx prisma db seed
```
Este comando crea automáticamente:
* **Superadmin:** Cédula `1100000000` / Contraseña `admin123`
* **Mecánico 1:** Cédula `1100000001` / Contraseña `123456`
* **Mecánico 2:** Cédula `1100000002` / Contraseña `123456`
* **Mecánico 3:** Cédula `1100000003` / Contraseña `123456`
* Clientes, vehículos, turnos en diversos estados y diagnósticos de prueba.

### Paso 7: Iniciar el servidor en modo desarrollo
```bash
npm run dev
```
El servidor quedará escuchando en `http://localhost:3000` y la documentación interactiva Swagger en `http://localhost:3000/api/docs`.

---

## 4. Endpoints Principales de la API (`/api/v1`)

### Autenticación
* `POST /api/v1/auth/login` - Inicio de sesión con cédula y contraseña para Mecánicos y Superadmin (retorna JWT).

### Turnos (Público - Clientes)
* `POST /api/v1/turnos` - Solicitar turno ingresando cédula, nombre, celular, placa y motivo (generación segura de número diario correlativo).
* `POST /api/v1/turnos/consulta` - Consultar el estado y diagnósticos de un turno mediante `numeroTurno` y `placa`.
* `POST /api/v1/turnos/:id/calificacion` - Calificar con 1 a 5 estrellas y comentario un turno en estado `FINALIZADO` (requiere `numeroTurno` + `placa`).

### Mecánico (Requiere JWT con rol `MECANICO`)
* `GET /api/v1/mecanico/dashboard` - Obtiene turnos pendientes y turnos asignados al mecánico (aislado de calificaciones y estadísticas globales).
* `GET /api/v1/mecanico/turnos` - Turnos asignados agrupados en `EN_COLA`, `DIAGNOSTICADOS` y `FINALIZADOS` ordenados por `updatedAt DESC` (soporta filtro opcional `?placa=...`).
* `POST /api/v1/turnos/:id/tomar` - Asigna el turno al mecánico e inicia la atención (protegido contra concurrencia con transacciones atómicas; el segundo mecánico recibe `409 Conflict`).
* `POST /api/v1/turnos/:id/diagnosticos` - Agrega un diagnóstico técnico (permite múltiples diagnósticos sin sobrescribir).
* `GET /api/v1/turnos/:id/diagnosticos` - Lista todos los diagnósticos registrados para el turno.
* `PATCH /api/v1/diagnosticos/:id` - Edita un diagnóstico existente (solo por el autor).
* `PATCH /api/v1/turnos/:id/listo` - Marca el vehículo como `LISTO` para entrega.
* `PATCH /api/v1/turnos/:id/finalizar` - Finaliza la atención del turno y libera al mecánico a estado `DISPONIBLE`.
* `PATCH /api/v1/turnos/:id/no-asistio` - Registra inasistencia del cliente.
* `PATCH /api/v1/turnos/:id/reagendar` - Reagenda el turno para más tarde en el mismo día.

### Superadmin (Requiere JWT con rol `SUPERADMIN`)
* `GET /api/v1/admin/historial` - Historial global de todas las acciones con filtros por placa, mecánico, cliente, fecha, estado y paginación.
* `GET /api/v1/admin/calificaciones` - Monitoreo de calificaciones y opiniones con filtros por mecánico, estrellas, placa y fecha.
* `GET /api/v1/admin/diagnosticos` - Auditoría de todos los diagnósticos técnicos emitidos en el taller.

---

## 5. Eventos WebSockets (Socket.IO)

El servidor emite eventos en tiempo real para mantener sincronizado el frontend:
* `turno:creado` - Emitido al registrarse un nuevo turno.
* `turno:actualizado` - Emitido ante cualquier cambio en el estado del turno.
* `turno:asignado` - Emitido al asignarse o tomarse un turno por un mecánico.
* `turno:atencion` - Emitido cuando la atención comienza.
* `turno:diagnostico` - Emitido al agregar o editar un diagnóstico.
* `turno:listo` - Emitido cuando el vehículo está listo para entrega.
* `turno:finalizado` - Emitido al completarse la atención.
* `turno:reagendado` - Emitido al reagendarse un turno.
* `turno:cancelado` - Emitido si el turno es cancelado.

---

## 6. Pruebas Automatizadas

Ejecutar la suite completa de pruebas:
```bash
npm test
```
Para ejecutar en modo interactivo:
```bash
npm run test:watch
```

Cobertura de pruebas incluidas:
1. **Validadores de dominio:** Algoritmo oficial de Cédula Ecuatoriana (Módulo 10), Pasaportes, normalización de celular (+593...) y formato de placa.
2. **Autenticación JWT:** Emisión de tokens, verificación, rechazo de credenciales inválidas y contraseñas incorrectas.
3. **Control de acceso por roles (RBAC):** Restricción estricta de mecánicos hacia rutas administrativas (`403 Forbidden`).
4. **Ciclo de vida del turno:** Creación pública, consulta por número + placa, atención, múltiples diagnósticos y finalización.
5. **Protección de concurrencia:** Dos mecánicos intentando tomar el mismo turno simultáneamente (el segundo recibe `409 Conflict`).
6. **Calificaciones:** Validación de turno finalizado y prevención de calificaciones duplicadas.
