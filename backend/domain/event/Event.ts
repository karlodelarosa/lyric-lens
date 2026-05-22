export type CreateEventInput = {
  title: string;
  eventDate: string;
  setlistId?: string | null;
};

export type UpdateEventInput = {
  title?: string;
  eventDate?: string;
  setlistId?: string | null;
};

export type EventRow = {
  id: string;
  title: string;
  event_date: string;
  setlist_id: string | null;
};

export class Event {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly date: string,
    readonly setlistId?: string,
  ) {}

  static fromRow(row: EventRow): Event {
    return new Event(
      row.id,
      row.title,
      row.event_date,
      row.setlist_id ?? undefined,
    );
  }
}
