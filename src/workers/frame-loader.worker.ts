/// <reference lib="webworker" />

export type WorkerRequest =
  | {
      type: "LOAD_RANGE";
      start: number;
      end: number;
      basePath: string;
      pad: number;
      preferAvif: boolean;
    }
  | { type: "WARM"; indices: number[]; basePath: string; pad: number; preferAvif: boolean };

export type WorkerResponse =
  | {
      type: "FRAME";
      index: number;
      bitmap: ImageBitmap;
    }
  | {
      type: "ERROR";
      index: number;
      message: string;
    }
  | {
      type: "RANGE_DONE";
      start: number;
      end: number;
    };

function frameUrl(
  basePath: string,
  index: number,
  pad: number,
  preferAvif: boolean,
  useAvif: boolean,
) {
  const n = String(index).padStart(pad, "0");
  const ext = preferAvif && useAvif ? "avif" : "webp";
  return `${basePath}/frame-${n}.${ext}`;
}

async function loadBitmap(
  basePath: string,
  index: number,
  pad: number,
  preferAvif: boolean,
): Promise<ImageBitmap> {
  const tryAvif = preferAvif;
  const url = frameUrl(basePath, index, pad, preferAvif, tryAvif);
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    return await createImageBitmap(blob);
  } catch {
    const fallback = frameUrl(basePath, index, pad, false, false);
    const res = await fetch(fallback, { cache: "force-cache" });
    if (!res.ok) throw new Error(`frame ${index} ${res.status}`);
    const blob = await res.blob();
    return await createImageBitmap(blob);
  }
}

const inflight = new Set<number>();

async function emitFrame(
  index: number,
  basePath: string,
  pad: number,
  preferAvif: boolean,
) {
  if (inflight.has(index)) return;
  inflight.add(index);
  try {
    const bitmap = await loadBitmap(basePath, index, pad, preferAvif);
    const msg: WorkerResponse = { type: "FRAME", index, bitmap };
    self.postMessage(msg, [bitmap]);
  } catch (e) {
    const msg: WorkerResponse = {
      type: "ERROR",
      index,
      message: e instanceof Error ? e.message : "load failed",
    };
    self.postMessage(msg);
  } finally {
    inflight.delete(index);
  }
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const data = ev.data;
  if (data.type === "WARM") {
    await Promise.all(
      data.indices.map((i) =>
        emitFrame(i, data.basePath, data.pad, data.preferAvif),
      ),
    );
    return;
  }

  if (data.type === "LOAD_RANGE") {
    const { start, end, basePath, pad, preferAvif } = data;
    for (let i = start; i <= end; i++) {
      await emitFrame(i, basePath, pad, preferAvif);
    }
    self.postMessage({ type: "RANGE_DONE", start, end } satisfies WorkerResponse);
  }
};
