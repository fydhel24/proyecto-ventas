<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Clientes
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('nit_ci')->nullable()->index();
            $table->string('telefono')->nullable();
            $table->string('direccion')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Proveedores
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('nit')->nullable()->index();
            $table->string('telefono')->nullable();
            $table->string('direccion')->nullable();
            $table->string('contacto_nombre')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Refactor Productos (Add missing fields)
        Schema::table('productos', function (Blueprint $table) {
            if (!Schema::hasColumn('productos', 'codigo_barras')) {
                $table->string('codigo_barras')->nullable()->after('id')->index();
            }
            if (!Schema::hasColumn('productos', 'stock_minimo')) {
                $table->integer('stock_minimo')->default(5)->after('caracteristicas');
            }
            if (!Schema::hasColumn('productos', 'precio_venta')) {
                $table->decimal('precio_venta', 10, 2)->default(0)->after('precio_compra');
            }
            // Drop old prices
            $table->dropColumn(['precio_1', 'precio_2', 'precio_3', 'lote', 'fecha_vencimiento']);
        });

        // 4. Lotes (Pharma critical)
        Schema::create('lotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
            $table->string('numero_lote')->index();
            $table->date('fecha_vencimiento')->index();
            $table->integer('stock')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Compras
        Schema::create('compras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')->constrained('proveedores');
            $table->foreignId('user_id')->constrained('users');
            $table->date('fecha');
            $table->decimal('total', 10, 2);
            $table->string('comprobante_tipo')->nullable(); // Factura, Recibo
            $table->string('comprobante_numero')->nullable();
            $table->text('notas')->nullable();
            $table->string('estado')->default('completada');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('detalle_compras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compra_id')->constrained('compras')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos');
            $table->foreignId('lote_id')->nullable()->constrained('lotes');
            $table->integer('cantidad');
            $table->decimal('precio_compra', 10, 2);
            $table->timestamps();
        });

        // 6. Reservas
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->foreignId('user_id')->constrained('users');
            $table->dateTime('fecha_limite');
            $table->decimal('total', 10, 2);
            $table->string('estado')->default('pendiente'); // pendiente, convertida, cancelada
            $table->text('notas')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('detalle_reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reserva_id')->constrained('reservas')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->timestamps();
        });

        // 7. Configuracion
        Schema::create('configuraciones', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('descripcion')->nullable();
            $table->timestamps();
        });

        // 8. Adjust Ventas to use Cliente ID and include Tax/Discount
        Schema::table('ventas', function (Blueprint $table) {
            if (Schema::hasColumn('ventas', 'cliente')) {
                // We keep it temporarily or migrate data? 
                // Since this is a fresh setup or a major refactor, we'll add the FK
                $table->foreignId('cliente_id')->nullable()->after('id')->constrained('clientes');
            }
            $table->decimal('descuento', 10, 2)->default(0)->after('monto_total');
            $table->decimal('impuesto', 10, 2)->default(0)->after('descuento');
        });

        // Detail with Lote
        Schema::create('detalle_ventas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->constrained('ventas')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos');
            $table->foreignId('lote_id')->nullable()->constrained('lotes');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_ventas');
        Schema::dropIfExists('detalle_reservas');
        Schema::dropIfExists('reservas');
        Schema::dropIfExists('detalle_compras');
        Schema::dropIfExists('compras');
        Schema::dropIfExists('lotes');
        Schema::dropIfExists('proveedores');
        Schema::dropIfExists('clientes');
        Schema::dropIfExists('configuraciones');
        
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn(['codigo_barras', 'stock_minimo', 'precio_venta']);
        });

        Schema::table('ventas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cliente_id');
            $table->dropColumn(['descuento', 'impuesto']);
        });
    }
};
