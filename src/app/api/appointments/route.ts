import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAppointment,
  deleteAppointment,
  duplicateAppointment,
  getAgendaMetrics,
  getFinancialSummary,
  listAppointments,
  listBlocks,
  listNotifications,
  markNotificationsRead,
  updateAppointment,
} from "@/lib/appointments";
import { getSession } from "@/lib/auth";
import { categoryForService } from "@/data/dashboard-mock";
import { rooms } from "@/lib/calendar/config";

const createSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(8),
  clientEmail: z.union([z.string().email(), z.literal("")]).optional(),
  clientPhoto: z.string().optional(),
  serviceId: z.string(),
  serviceName: z.string(),
  category: z.string().optional(),
  professionalId: z.string(),
  professionalName: z.string(),
  roomId: z.string().optional(),
  roomName: z.string().optional(),
  startsAt: z.string(),
  durationMin: z.number().positive(),
  price: z.number().nonnegative(),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded"]).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("summary");
  if (mode === "1") {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(getFinancialSummary());
  }
  if (mode === "metrics") {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(getAgendaMetrics());
  }
  if (mode === "blocks") {
    return NextResponse.json(listBlocks());
  }
  if (mode === "notifications") {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(listNotifications());
  }
  return NextResponse.json(listAppointments());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body?.action === "duplicate") {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const copy = duplicateAppointment(body.id);
      if (!copy) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(copy, { status: 201 });
    }
    if (body?.action === "read-notifications") {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      markNotificationsRead();
      return NextResponse.json({ ok: true });
    }
    const data = createSchema.parse(body);
    const room = rooms.find((r) => r.id === data.roomId) || rooms[0];
    const apt = createAppointment({
      ...data,
      clientEmail: data.clientEmail || "",
      category: (data.category as ReturnType<typeof categoryForService>) ||
        categoryForService(data.serviceId),
      roomId: room.id,
      roomName: data.roomName || room.name,
      notes: data.notes || "",
      paymentMethod: data.paymentMethod || "A definir",
      paymentStatus: data.paymentStatus || "pending",
      status: (data.status as "scheduled") || "pending",
    });
    return NextResponse.json(apt, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const updated = updateAppointment(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const ok = deleteAppointment(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid" },
      { status: 400 },
    );
  }
}
