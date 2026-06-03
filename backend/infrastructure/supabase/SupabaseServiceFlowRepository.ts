import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ServiceFlow,
  type CreateServiceFlowInput,
  type ServiceFlowDetailRow,
  type ServiceFlowListItem,
  type ServiceFlowListRow,
  type ServiceFlowSegmentInput,
  type ServiceFlowSegmentKind,
  type UpdateServiceFlowInput,
} from "../../domain/serviceFlow/ServiceFlow";
import type { ServiceFlowRepository } from "../../domain/serviceFlow/ServiceFlowRepository";
import type { Database } from "./database.types";

const SERVICE_FLOW_DETAIL_SELECT = `
  id,
  title,
  description,
  service_flow_segments (
    id,
    position,
    label,
    kind,
    notes,
    setlist_id,
    setlists ( id, title ),
    service_flow_segment_announcements (
      announcement_id,
      position,
      announcements ( id, title, body, category, expires_at, slides )
    )
  )
`;

const SERVICE_FLOW_LIST_SELECT = `
  id,
  title,
  description,
  service_flow_segments ( id )
`;

export class SupabaseServiceFlowRepository implements ServiceFlowRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listByOrganization(
    organizationId: string,
  ): Promise<ServiceFlowListItem[]> {
    const { data, error } = await this.client
      .from("service_flows")
      .select(SERVICE_FLOW_LIST_SELECT)
      .eq("organization_id", organizationId)
      .order("title");

    if (error) {
      throw new Error(`Failed to load service flows: ${error.message}`);
    }

    return (data ?? []).map((row) => {
      const listRow = row as unknown as ServiceFlowListRow;
      return {
        id: listRow.id,
        title: listRow.title,
        description: listRow.description,
        segmentCount: listRow.service_flow_segments?.length ?? 0,
      };
    });
  }

  async getById(
    organizationId: string,
    serviceFlowId: string,
  ): Promise<ServiceFlow | null> {
    const { data, error } = await this.client
      .from("service_flows")
      .select(SERVICE_FLOW_DETAIL_SELECT)
      .eq("id", serviceFlowId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load service flow: ${error.message}`);
    }

    if (!data) return null;

    return ServiceFlow.fromDetailRow(data as unknown as ServiceFlowDetailRow);
  }

  async create(
    organizationId: string,
    createdBy: string,
    input: CreateServiceFlowInput,
  ): Promise<ServiceFlow> {
    const { data: flowRow, error: flowError } = await this.client
      .from("service_flows")
      .insert({
        organization_id: organizationId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        created_by: createdBy,
      })
      .select("id")
      .single();

    if (flowError || !flowRow) {
      throw new Error(
        `Failed to create service flow: ${flowError?.message ?? "unknown"}`,
      );
    }

    await this.replaceSegments(flowRow.id, input.segments);

    const created = await this.getById(organizationId, flowRow.id);
    if (!created) {
      throw new Error("Failed to load created service flow");
    }

    return created;
  }

  async update(
    organizationId: string,
    serviceFlowId: string,
    input: UpdateServiceFlowInput,
  ): Promise<ServiceFlow> {
    if (input.title !== undefined || input.description !== undefined) {
      const patch: Database["public"]["Tables"]["service_flows"]["Update"] = {
        updated_at: new Date().toISOString(),
      };

      if (input.title !== undefined) patch.title = input.title.trim();
      if (input.description !== undefined) {
        patch.description = input.description?.trim() || null;
      }

      const { error } = await this.client
        .from("service_flows")
        .update(patch)
        .eq("id", serviceFlowId)
        .eq("organization_id", organizationId);

      if (error) {
        throw new Error(`Failed to update service flow: ${error.message}`);
      }
    }

    if (input.segments !== undefined) {
      await this.replaceSegments(serviceFlowId, input.segments);
    }

    const updated = await this.getById(organizationId, serviceFlowId);
    if (!updated) {
      throw new Error("Failed to load updated service flow");
    }

    return updated;
  }

  async delete(organizationId: string, serviceFlowId: string): Promise<void> {
    const { error } = await this.client
      .from("service_flows")
      .delete()
      .eq("id", serviceFlowId)
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error("Failed to delete service flow");
    }
  }

  async duplicate(
    organizationId: string,
    createdBy: string,
    serviceFlowId: string,
  ): Promise<ServiceFlow> {
    const source = await this.getById(organizationId, serviceFlowId);
    if (!source) {
      throw new Error("Service flow not found");
    }

    return this.create(organizationId, createdBy, {
      title: `${source.title} (Copy)`,
      description: source.description,
      segments: source.segments.map((segment) => ({
        label: segment.label,
        kind: segment.kind,
        notes: segment.notes,
        setlistId: segment.setlistId,
        announcementIds: segment.announcements.map((item) => item.id),
      })),
    });
  }

  private async replaceSegments(
    serviceFlowId: string,
    segments: ServiceFlowSegmentInput[],
  ) {
    const { data: existingSegments, error: listError } = await this.client
      .from("service_flow_segments")
      .select("id")
      .eq("service_flow_id", serviceFlowId);

    if (listError) {
      throw new Error("Failed to update service flow segments");
    }

    const segmentIds = (existingSegments ?? []).map((row) => row.id);
    if (segmentIds.length > 0) {
      const { error: deleteLinksError } = await this.client
        .from("service_flow_segment_announcements")
        .delete()
        .in("segment_id", segmentIds);

      if (deleteLinksError) {
        throw new Error("Failed to update service flow segments");
      }
    }

    const { error: deleteSegmentsError } = await this.client
      .from("service_flow_segments")
      .delete()
      .eq("service_flow_id", serviceFlowId);

    if (deleteSegmentsError) {
      throw new Error("Failed to update service flow segments");
    }

    for (const [index, segment] of segments.entries()) {
      await this.insertSegment(serviceFlowId, index, segment);
    }
  }

  private async insertSegment(
    serviceFlowId: string,
    position: number,
    segment: ServiceFlowSegmentInput,
  ) {
    const kind = segment.kind as ServiceFlowSegmentKind;
    const setlistId = kind === "music" ? (segment.setlistId ?? null) : null;

    const { data: segmentRow, error: segmentError } = await this.client
      .from("service_flow_segments")
      .insert({
        service_flow_id: serviceFlowId,
        position,
        label: segment.label.trim(),
        kind,
        notes: segment.notes?.trim() || null,
        setlist_id: setlistId,
      })
      .select("id")
      .single();

    if (segmentError || !segmentRow) {
      throw new Error(
        `Failed to create service flow segment: ${segmentError?.message ?? "unknown"}`,
      );
    }

    if (kind !== "announcements") return;

    const announcementIds = segment.announcementIds ?? [];
    if (announcementIds.length === 0) return;

    const { error: linkError } = await this.client
      .from("service_flow_segment_announcements")
      .insert(
        announcementIds.map((announcementId, index) => ({
          segment_id: segmentRow.id,
          announcement_id: announcementId,
          position: index,
        })),
      );

    if (linkError) {
      throw new Error("Failed to link announcements to segment");
    }
  }
}
