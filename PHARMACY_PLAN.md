# Sistema de Farmacia Bolivia - Plan de Implementación

Este documento detalla los pasos para transformar el sistema actual en un sistema de farmacia completo de "Gold Standard".

## 1. Base de Datos (Migraciones y Modelos)
- [ ] Refactorizar `productos`: Separar lotes a una tabla independiente.
- [ ] Crear tabla `proveedores`.
- [ ] Crear tabla `clientes`.
- [ ] Crear tabla `lotes`.
- [ ] Crear tablas de `compras` y `detalle_compras`.
- [ ] Crear tabla `reservas`.
- [ ] Crear tabla `configuracion` para NIT, Dirección, etc.
- [ ] Actualizar `ventas` y `detalle_ventas` para incluir impuestos y descuentos.

## 2. Backend (Lógica de Negocio)
- [ ] **Services**: Implementar `VentaService`, `CompraService`, `LoteService`.
- [ ] **Scopes**: `activos()`, `bajoStock()`, `proximosAVencer()` en modelos.
- [ ] **Validaciones**: `FormRequest` para cada módulo.
- [ ] **PDF**: Generación de ticket térmico con FPDF.

## 3. Frontend (React + shadcn/ui)
- [ ] **Dashboard**: Resumen de ventas, stock bajo, vencimientos.
- [ ] **POS (Ventas)**: Interfaz rápida con búsqueda en tiempo real.
- [ ] **Inventario**: CRUD de productos, laboratorios, proveedores y gestión de lotes.
- [ ] **Reservas**: Gestión de estados de reserva (Pendiente, Convertida, Cancelada).
- [ ] **Landing Page**: Página pública profesional.

## 4. Calidad y UX
- [ ] Implementar sistema de alertas visuales.
- [ ] Asegurar que todo esté en español.
- [ ] Optimizar para responsive (Tablets).
