import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface Detalle {
    id: number;
    cantidad: number;
    precio_venta: number;
    subtotal: number;
    inventario: {
        producto: {
            nombre: string;
        }
    }
}

interface Venta {
    id: number;
    cliente: string;
    ci: string;
    tipo_pago: string;
    monto_total: number;
    pagado: number;
    cambio: number;
    created_at: string;
    vendedor: { name: string };
    sucursal: { nombre_sucursal: string; direccion?: string; telefono?: string };
    detalles: Detalle[];
}

interface Props {
    venta: Venta;
}

export default function Ticket({ venta }: Props) {
    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    return (
        <div className="ticket-container bg-white min-h-screen text-black flex justify-center py-10 font-mono">
            <Head title={`Ticket #${venta.id}`} />

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        margin: 0;
                        size: 80mm 200mm;
                    }
                    body {
                        background: white;
                    }
                    .no-print {
                        display: none;
                    }
                    .ticket-container {
                        padding: 0;
                        width: 80mm;
                    }
                }
                .ticket-content {
                    width: 80mm;
                    padding: 10px;
                    border: 1px dashed #ccc;
                }
            ` }} />

            <div className="ticket-content">
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold uppercase">Nexus Proyecto</h1>
                    <p className="text-sm font-bold">{venta.sucursal.nombre_sucursal}</p>
                    {venta.sucursal.direccion && <p className="text-[10px]">{venta.sucursal.direccion}</p>}
                    {venta.sucursal.telefono && <p className="text-[10px]">Telf: {venta.sucursal.telefono}</p>}
                </div>

                <div className="mb-4 text-xs border-y border-dashed py-2">
                    <p><strong>Nro Venta:</strong> {venta.id.toString().padStart(6, '0')}</p>
                    <p><strong>Fecha:</strong> {new Date(venta.created_at).toLocaleString()}</p>
                    <p><strong>Vendedor:</strong> {venta.vendedor.name}</p>
                </div>

                <div className="mb-4 text-xs">
                    <p><strong>Cliente:</strong> {venta.cliente}</p>
                    {venta.ci && <p><strong>NIT/CI:</strong> {venta.ci}</p>}
                    <p><strong>Pago:</strong> {venta.tipo_pago}</p>
                </div>

                <table className="w-full text-[10px] mb-4">
                    <thead>
                        <tr className="border-b border-dashed">
                            <th className="text-left pb-1">Desc.</th>
                            <th className="text-center pb-1">Cant.</th>
                            <th className="text-right pb-1">P.U.</th>
                            <th className="text-right pb-1">Subt.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venta.detalles.map((det) => (
                            <tr key={det.id}>
                                <td className="py-1">{det.inventario.producto.nombre}</td>
                                <td className="text-center">{det.cantidad}</td>
                                <td className="text-right">{det.precio_venta}</td>
                                <td className="text-right">{det.subtotal}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="border-t border-dashed pt-2 space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                        <span>TOTAL:</span>
                        <span>Bs. {venta.monto_total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>EFECTIVO:</span>
                        <span>Bs. {venta.pagado.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm">
                        <span>CAMBIO:</span>
                        <span>Bs. {venta.cambio.toFixed(2)}</span>
                    </div>
                </div>

                <div className="text-center mt-6 text-[10px]">
                    <p>¡GRACIAS POR SU COMPRA!</p>
                    <p>Nexus • Gestión Eficiente</p>
                </div>

                <div className="no-print mt-10 text-center">
                    <button
                        onClick={() => window.print()}
                        className="bg-primary text-white px-6 py-2 rounded-full font-bold shadow-lg"
                    >
                        Re-imprimir
                    </button>
                    <p className="mt-2 text-[10px] text-muted-foreground">Presione Ctrl+P si no abre automáticamente.</p>
                </div>
            </div>
        </div>
    );
}
