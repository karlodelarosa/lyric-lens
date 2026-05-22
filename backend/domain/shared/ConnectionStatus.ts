export type ConnectionStatus =
  | {
      ok: true;
      checkedAt: string;
      projectRef: string;
    }
  | {
      ok: false;
      checkedAt: string;
      projectRef: string;
      message: string;
    };
