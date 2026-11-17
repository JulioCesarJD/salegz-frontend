import React, { useMemo, useState } from "react";
import { Trash2, Shield } from "lucide-react";
import { usePermiso } from "../hooks/usePermiso";
import { P } from "../store/permisosStore";
import {
  useMenuSemanal,
  useCreateMenuSemanal,
  useUpdateMenuSemanal,
  useDeleteMenuSemanal,
} from "../hooks/useMenuSemanal";
import { useRecetas } from "../hooks/useRecetas";
import { DIAS_SEMANA, diaSemanaLabel } from "../models/menuSemanal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

const SERVICIOS = ["Almuerzo", "Desayuno"];
const SEMANAS = [1, 2, 3, 4, 5];
// Solo días laborables (lunes a viernes)
const DIAS = DIAS_SEMANA.filter((d) => !/s[aá]bado|domingo/i.test(d.label));

const norm = (s) => (s || "").toString().trim().toLowerCase();

export function MenuSemanalPage() {
  const { puedeVer, tienePermiso } = usePermiso();
  const puedeAcceder = puedeVer(P.MenuSemanal.Ver);
  const puedeCrear = tienePermiso(P.MenuSemanal.Crear);
  const puedeEditar = tienePermiso(P.MenuSemanal.Editar);
  const puedeEliminar = tienePermiso(P.MenuSemanal.Eliminar);
  const puedeVerRecetas = puedeVer(P.Recetas.Ver);

  const [servicio, setServicio] = useState(SERVICIOS[0]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: menus = [], isLoading } = useMenuSemanal(
    { pageSize: 200 },
    { enabled: puedeAcceder },
  );
  const { data: recetas = [] } = useRecetas(
    { pageSize: 200 },
    { enabled: puedeAcceder && puedeVerRecetas },
  );

  const create = useCreateMenuSemanal();
  const update = useUpdateMenuSemanal();
  const remove = useDeleteMenuSemanal();
  const guardando = create.isPending || update.isPending;

  // Índice: "semana-dia" -> menú del servicio seleccionado
  const grid = useMemo(() => {
    const map = new Map();
    menus
      .filter((m) => norm(m.servicio) === norm(servicio))
      .forEach((m) => map.set(`${Number(m.semana)}-${Number(m.diaSemana)}`, m));
    return map;
  }, [menus, servicio]);

  // Solo el servicio de Almuerzo permite eliminar
  const puedeEliminarServicio = puedeEliminar && norm(servicio) === "almuerzo";

  if (!puedeAcceder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2
            style={{ color: "var(--text-primary)" }}
            className="text-2xl font-bold mb-2"
          >
            Acceso Denegado
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            No tienes permisos para acceder al menú semanal
          </p>
        </div>
      </div>
    );
  }

  // Al elegir una receta en el select: crea o actualiza el menú de esa celda
  const handleSelect = (menu, semana, diaSemana, recetaId) => {
    const receta = recetas.find((r) => String(r.recetaId) === String(recetaId));
    const porciones = Number(menu?.detalles?.[0]?.porciones) || 1;
    const detalles =
      recetaId === ""
        ? []
        : [
            {
              recetaId: Number(recetaId),
              recetaNombre: receta?.nombre,
              porciones,
            },
          ];

    if (menu) {
      update.mutate({
        menuSemanalId: menu.menuSemanalId,
        data: { ...menu, detalles },
      });
    } else if (recetaId !== "") {
      create.mutate({
        semana,
        diaSemana: Number(diaSemana),
        servicio,
        estado: true,
        detalles,
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Menú semanal</h1>
          <p className="page-sub">
            Planificación de recetas para cinco semanas
          </p>
        </div>
      </div>

      {/* Pestañas de servicio */}
      <div
        className="inline-flex gap-1 p-1 rounded-xl"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
        role="tablist"
      >
        {SERVICIOS.map((s) => {
          const activo = s === servicio;
          return (
            <button
              key={s}
              role="tab"
              aria-selected={activo}
              onClick={() => setServicio(s)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              style={{
                color: activo ? "var(--brand)" : "var(--text-muted)",
                backgroundColor: activo
                  ? "var(--bg-primary, #fff)"
                  : "transparent",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Cuadrícula semanas x días */}
      <div className="tbl-wrap overflow-x-auto">
        <table className="tbl" style={{ tableLayout: "fixed", minWidth: 960 }}>
          <thead>
            <tr>
              <th style={{ width: 72 }}></th>
              {DIAS.map((d) => (
                <th key={d.value}>{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={DIAS.length + 1} className="text-center py-10">
                  Cargando...
                </td>
              </tr>
            ) : (
              SEMANAS.map((semana) => (
                <tr key={semana}>
                  <td className="text-center">
                    <p
                      className="text-[10px] uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Semana
                    </p>
                    <p className="text-xl font-bold">{semana}</p>
                  </td>

                  {DIAS.map((d) => {
                    const menu = grid.get(`${semana}-${Number(d.value)}`);
                    const recetaActual = menu?.detalles?.[0];
                    const valor =
                      recetaActual?.recetaId != null
                        ? String(recetaActual.recetaId)
                        : "";
                    const bloqueado =
                      guardando || (menu ? !puedeEditar : !puedeCrear);

                    // Si el usuario no puede ver recetas, al menos mostramos la actual
                    const opciones =
                      recetas.length > 0
                        ? recetas
                        : recetaActual
                          ? [
                              {
                                recetaId: recetaActual.recetaId,
                                nombre: recetaActual.recetaNombre,
                              },
                            ]
                          : [];

                    return (
                      <td key={d.value} className="align-top">
                        <div className="relative group">
                          <select
                            className="input w-full"
                            style={{
                              height: "auto",
                              minHeight: 62,
                              whiteSpace: "normal",
                              paddingRight:
                                puedeEliminarServicio && menu ? 34 : undefined,
                            }}
                            value={valor}
                            disabled={bloqueado}
                            onChange={(e) =>
                              handleSelect(
                                menu,
                                semana,
                                d.value,
                                e.target.value,
                              )
                            }
                            aria-label={`${diaSemanaLabel(d.value)}, semana ${semana}`}
                          >
                            <option value="">Sin receta</option>
                            {opciones.map((r) => (
                              <option
                                key={r.recetaId}
                                value={String(r.recetaId)}
                              >
                                {r.nombre}
                              </option>
                            ))}
                          </select>

                          {menu && puedeEliminarServicio && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(menu)}
                              className="btn-ghost btn-icon btn-sm text-red-500 absolute top-1 right-6 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                              title="Eliminar servicio"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && menus.length === 0 && (
        <div className="text-center py-6">
          <Shield
            size={28}
            className="mx-auto mb-2"
            style={{ color: "var(--text-muted)" }}
          />
          <p style={{ color: "var(--text-muted)" }}>
            Aún no hay recetas asignadas. Elige una en cualquier día.
          </p>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          remove.mutate(deleteTarget.menuSemanalId);
          setDeleteTarget(null);
        }}
        title="Eliminar servicio"
        message={`¿Eliminar el almuerzo de la semana ${deleteTarget?.semana ?? ""} (${diaSemanaLabel(deleteTarget?.diaSemana)})? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
