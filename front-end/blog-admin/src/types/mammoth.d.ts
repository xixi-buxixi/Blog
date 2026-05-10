declare module 'mammoth' {
  interface MammothOptions {
    arrayBuffer?: ArrayBuffer;
  }

  interface MammondResult {
    value: string;
    messages: any[];
  }

  export function convertToHtml(options: MammothOptions): Promise<MammondResult>;
  export function extractRawText(options: MammothOptions): Promise<MammondResult>;
}