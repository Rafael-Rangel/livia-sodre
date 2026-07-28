/// <reference lib="webworker" />

export type WorkerRequest =
  | {
      type: "LOAD_RANGE";
      start: number;
      end: number;
      basePath: string;
      pad: number;
      preferAvif: boolean;
      concurrency?: number;
    }
  | {
      type: "WARM";
      indices: number[];
      basePath: string;
      pad: number;
      preferAvif: boolean;
    };

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
  useAvif: boolean,
) {
  const n = String(index).padStart(pad, "0");
  return `${basePath}/frame-${n}.${useAvif ? "avif" : "webp"}`;
}

async function loadBitmap(
  basePath: string,
  index: number,
  pad: number,
  preferAvif: boolean,
): Promise<ImageBitmap> {
  const primary = frameUrl(basePath, index, pad, preferAvif);
  try {
    const res = await fetch(primary, { cache: "force-cache" });
    if (!res.ok) throw new Error(String(res.status));
    return await createImageBitmap(await res.blob());
  } catch {
    const fallback = frameUrl(basePath, index, pad, false);
    const res = await fetch(fallback, { cache: "force-cache" });
    if (!res.ok) throw new Error(`frame ${index} ${res.status}`);
    return await createImageBitmap(await res.blob());
  }
}

const inflight = new Set<number>();
const done = new Set<number>();

async function emitFrame(
  index: number,
  basePath: string,
  pad: number,
  preferAvif: boolean,
) {
  if (done.has(index) || inflight.has(index)) return;
  inflight.add(index);
  try {
    const bitmap = await loadBitmap(basePath, index, pad, preferAvif);
    done.add(index);
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

async function mapPool(
  indices: number[],
  concurrency: number,
  fn: (i: number) => Promise<void>,
) {
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, indices.length) },
    async () => {
      while (cursor < indices.length) {
        const i = cursor++;
        await fn(indices[i]);
      }
    },
  );
  await Promise.all(workers);
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const data = ev.data;

  if (data.type === "WARM") {
    await mapPool(data.indices, 6, (i) =>
      emitFrame(i, data.basePath, data.pad, data.preferAvif),
    );
    return;
  }

  if (data.type === "LOAD_RANGE") {
    const { start, end, basePath, pad, preferAvif } = data;
    const concurrency = data.concurrency ?? 6;
    const indices: number[] = [];
    for (let i = start; i <= end; i++) indices.push(i);
    await mapPool(indices, concurrency, (i) =>
      emitFrame(i, basePath, pad, preferAvif),
    );
    self.postMessage({
      type: "RANGE_DONE",
      start,
      end,
    } satisfies WorkerResponse);
  }
};
