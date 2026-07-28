declare module "split-type" {
  export type SplitTypeOptions = {
    types?: string | string[];
    tagName?: string;
  };

  export default class SplitType {
    chars: HTMLElement[] | null;
    words: HTMLElement[] | null;
    lines: HTMLElement[] | null;
    constructor(target: string | HTMLElement | HTMLElement[], options?: SplitTypeOptions);
    revert(): void;
  }
}
