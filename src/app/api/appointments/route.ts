import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAppointment,
  listAppointments,
  updateAppointment,
  getFinancialSummary,
} from "@/lib/appointments";
import { getSession } from "@/lib/auth";

const createSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(8),
  clientEmail: z.union([z.string().email(), z.literal("")]),
  serviceId: z.string(),
  serviceName: z.string(),
  professionalId: z.string(),
  professionalName: z.string(),
  startsAt: z.string(),
  durationMin: z.number().positive(),
  price: z.number().nonnegative(),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("summary") === "1") {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(getFinancialSummary());
  }
  return NextResponse.json(listAppointments());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const apt = createAppointment({
      ...data,
      notes: data.notes || "",
      paymentMethod: data.paymentMethod || "A definir",
      paymentStatus: "pending",
      status: "pending",
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
